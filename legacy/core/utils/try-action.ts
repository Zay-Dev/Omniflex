import { logger as defaultLogger } from '../';

const defaultNext: (error: any) => any = (error) => { throw error; };

export const tryAction = async function (
  action: () => Promise<any> | any,
  {
    next = defaultNext,
    logger = defaultLogger,
    streamErrorToConsole = false,
  } = {},
) {
  try {
    return await action();
  } catch (error) {
    streamErrorToConsole && console.error(error);

    logger.error(error instanceof Error ?
      { error } : { data: error }
    );

    return next(error);
  }
};