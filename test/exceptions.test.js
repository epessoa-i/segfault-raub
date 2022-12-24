'use strict';

const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const { platform } = require('addon-tools-raub');


jest.setTimeout(30000);

const runAndGetError = async (name) => {
	let response = '';
	try {
		const { stderr, stdout } = await exec(`node -e "require('.').${name}()"`);
		response = stderr + stdout;
	} catch (error) {
		response = error.message;
	}
	return response;
};

describe('Exceptions', () => {
	it('Reports segfaults', async () => {
		let response = await runAndGetError('causeSegfault');
		const exceptionName = platform === 'windows' ? 'ACCESS_VIOLATION' : 'SIGSEGV';
		expect(response).toContain(exceptionName);
	});
	
	if (platform !== 'osx') {
		it('Reports division by zero (integer)', async () => {
			let response = await runAndGetError('causeDivisionInt');
			const exceptionName = platform === 'windows' ? 'INT_DIVIDE_BY_ZERO' : 'SIGILL';
			console.log('RESPONSE `', response, '`');
			expect(response).toContain(exceptionName);
		});
		
		it('Reports stack overflow', async () => {
			let response = await runAndGetError('causeOverflow');
			const exceptionName = platform === 'windows' ? 'STACK_OVERFLOW' : 'SIGSEGV';
			console.log('RESPONSE `', response, '`');
			expect(response).toContain(exceptionName);
		});
	}
	
	it('Reports illegal operation', async () => {
		let response = await runAndGetError('causeIllegal');
		const exceptionName = platform === 'windows' ? 'ILLEGAL_INSTRUCTION' : 'SIGILL';
		expect(response).toContain(exceptionName);
	});
});
