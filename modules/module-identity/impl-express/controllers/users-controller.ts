import { Request, Response } from '@omniflex/infra-express/types'
import { errors } from '@omniflex/core'
import { identityContainer } from '@omniflex/module-identity-core/containers'
import { IUserRepository } from '@omniflex/module-identity-core/types'

export class UsersController {
  private readonly _userRepository: IUserRepository<string>

  constructor() {
    this._userRepository = identityContainer.resolve('userRepository')
  }

  getUser = async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await this._userRepository.findById(id)
    if (!user) {
      throw errors.notFound('USER_NOT_FOUND')
    }

    return res.json(user)
  }

  getUserByIdentifier = async (req: Request, res: Response) => {
    const { identifier } = req.params

    const user = await this._userRepository.findByIdentifier(identifier)
    if (!user) {
      throw errors.notFound('USER_NOT_FOUND')
    }

    return res.json(user)
  }

  getUserByUsername = async (req: Request, res: Response) => {
    const { username } = req.params

    const user = await this._userRepository.findByUsername(username)
    if (!user) {
      throw errors.notFound('USER_NOT_FOUND')
    }

    return res.json(user)
  }

  getUserByEmail = async (req: Request, res: Response) => {
    const { email } = req.params

    const user = await this._userRepository.findByEmail(email)
    if (!user) {
      throw errors.notFound('USER_NOT_FOUND')
    }

    return res.json(user)
  }
}

export const create = () => new UsersController() 