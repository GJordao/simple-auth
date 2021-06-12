import { validate } from '../validation';

const deleteUndefined = (obj) => {
    const _obj = { ...obj };
    Object.keys(obj).forEach((key) => {
        if (obj[key] === undefined) delete _obj[key];
    });
    return _obj;
};

describe('Environment variables type/definition validation', () => {
    describe.each`
        testId                                                                                             | expectingError | DATABASE_TYPE | DATABASE_HOST  | DATABASE_PORT | DATABASE_USERNAME | DATABASE_PASSWORD | DATABASE_NAME | PASSWORD_PEPPER | PORT              | TOKEN_ENCRYPTION_KEY     | ACCESS_TOKEN_EXPIRE_TIME | REFRESH_TOKEN_EXPIRE_TIME | MODE         | SMTP_HOST     | SMTP_PORT    | SMTP_SECURE  | SMTP_USER    | SMTP_PASSWORD   | SMTP_MAIL_FROM | AUTH_URL          | ACCOUNT_CONFIRMATION_REDIRECT_URL | DB_SESSIONS  | PASSWORD_RESET_URL
        ${'should accept when passing all required variables'}                                             | ${false}       | ${'postgres'} | ${'localhost'} | ${5432}       | ${'jack'}         | ${'jack22'}       | ${'jackDb'}   | ${undefined}    | ${undefined}      | ${'some_encryption_key'} | ${undefined}             | ${undefined}              | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | ${undefined}    | ${undefined}   | ${undefined}      | ${undefined}                      | ${undefined} | ${undefined}
        ${'should accept when setting all required variables, all SMTP_* and PASSWORD_RESET_URL'}          | ${false}       | ${'postgres'} | ${'localhost'} | ${5432}       | ${'jack'}         | ${'jack22'}       | ${'jackDb'}   | ${undefined}    | ${undefined}      | ${'some_encryption_key'} | ${undefined}             | ${undefined}              | ${undefined} | ${'somehost'} | ${25}        | ${false}     | ${'jack'}    | ${'h1t7heR0ad'} | ${'Jack Doe'}  | ${'example.com/'} | ${undefined}                      | ${undefined} | ${'somepage.example/reset/url'}
        ${'should complain when missing all required variables'}                                           | ${true}        | ${undefined}  | ${undefined}   | ${undefined}  | ${undefined}      | ${undefined}      | ${undefined}  | ${undefined}    | ${undefined}      | ${undefined}             | ${undefined}             | ${undefined}              | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | ${undefined}    | ${undefined}   | ${undefined}      | ${undefined}                      | ${undefined} | ${undefined}
        ${'should complain when setting all required variables except DATABASE_TYPE'}                      | ${true}        | ${undefined}  | ${'localhost'} | ${5432}       | ${'jack'}         | ${'jack22'}       | ${'jackDb'}   | ${undefined}    | ${undefined}      | ${'some_encryption_key'} | ${undefined}             | ${undefined}              | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | ${undefined}    | ${undefined}   | ${undefined}      | ${undefined}                      | ${undefined} | ${undefined}
        ${'should complain when setting all required variables and all SMTP_* but not PASSWORD_RESET_URL'} | ${true}        | ${'postgres'} | ${'localhost'} | ${5432}       | ${'jack'}         | ${'jack22'}       | ${'jackDb'}   | ${undefined}    | ${undefined}      | ${'some_encryption_key'} | ${undefined}             | ${undefined}              | ${undefined} | ${'somehost'} | ${25}        | ${false}     | ${'jack'}    | ${'h1t7heR0ad'} | ${'Jack Doe'}  | ${'example.com/'} | ${undefined}                      | ${undefined} | ${undefined}
        ${'should complain when PORT is set with a string that is not a positive integer'}                 | ${true}        | ${'postgres'} | ${'localhost'} | ${5432}       | ${'jack'}         | ${'jack22'}       | ${'jackDb'}   | ${undefined}    | ${'fiveThousand'} | ${'some_encryption_key'} | ${undefined}             | ${undefined}              | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | ${undefined}    | ${undefined}   | ${undefined}      | ${undefined}                      | ${undefined} | ${undefined}
        ${'should complain when DATABASE_TYPE is neither one of "postgres", "mysql" nor "sqlite"'}         | ${true}        | ${'mongodb'}  | ${'localhost'} | ${5432}       | ${'jack'}         | ${'jack22'}       | ${'jackDb'}   | ${undefined}    | ${undefined}      | ${'some_encryption_key'} | ${undefined}             | ${undefined}              | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | ${undefined}    | ${undefined}   | ${undefined}      | ${undefined}                      | ${undefined} | ${undefined}
    `('', (envs) => {
        const { testId, expectingError } = envs;
        it(`${testId}`, () => {
            const _envs = deleteUndefined(envs);

            let error = false;
            try {
                validate(_envs);
            } catch (err) {
                error = !!err;
            }
            expect(error).toBe(expectingError);
        });
    });
});

describe('Environment variables default values validation', () => {
    const required = {
        DATABASE_TYPE: 'postgres',
        DATABASE_HOST: 'localhost',
        DATABASE_PORT: 5432,
        DATABASE_USERNAME: 'jack',
        DATABASE_PASSWORD: 'jack123',
        DATABASE_NAME: 'jackDb',
        TOKEN_ENCRYPTION_KEY: 'foo'
    };

    describe.each`
        testId                                      | env                                    | defaultValue
        ${'PASSWORD_PEPPER = ""'}                   | ${'PASSWORD_PEPPER'}                   | ${''}
        ${'PORT = 5000'}                            | ${'PORT'}                              | ${5000}
        ${'ACCESS_TOKEN_EXPIRE_TIME = 600'}         | ${'ACCESS_TOKEN_EXPIRE_TIME'}          | ${600}
        ${'REFRESH_TOKEN_EXPIRE_TIME = 2629743'}    | ${'REFRESH_TOKEN_EXPIRE_TIME'}         | ${2629743}
        ${'MODE = "prod"'}                          | ${'MODE'}                              | ${'prod'}
        ${'SMTP_SECURE default = False'}            | ${'SMTP_SECURE'}                       | ${false}
        ${'ACCOUNT_CONFIRMATION_REDIRECT_URL = ""'} | ${'ACCOUNT_CONFIRMATION_REDIRECT_URL'} | ${''}
        ${'DB_SESSIONS = False'}                    | ${'DB_SESSIONS'}                       | ${false}
    `('', (envs) => {
        const { testId, env, defaultValue } = envs;
        it(`${testId}`, () => {
            const config = validate(required);
            expect(config[env]).toBe(defaultValue);
        });
    });
});
