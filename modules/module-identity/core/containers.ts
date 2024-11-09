import { appContainer, Awilix } from '@omniflex/core/containers'
import { IUserRepository, IUserProfileRepository, IUserPasswordRepository } from './types'

type TIdentityContainer = {
  userRepository: IUserRepository<string>
  userProfileRepository: IUserProfileRepository<string>
  userPasswordRepository: IUserPasswordRepository<string>
}

export const identityContainer = appContainer.createScope<TIdentityContainer>()

export const registerRepositories = (repositories: Partial<TIdentityContainer>) => {
  identityContainer.register({
    ...Object.entries(repositories).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: Awilix.asValue(value)
    }), {})
  })
}