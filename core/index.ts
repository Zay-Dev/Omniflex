import { appContainer } from './containers';

export const getLogger = () => appContainer.resolve('logger');