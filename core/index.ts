import { appContainer } from './containers';

//export const getLogger = () => appContainer.resolve('logger');
export const logger = appContainer.resolve('logger');