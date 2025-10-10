import { User } from '../../domain/entities/User'
import { Email } from '../../domain/value-objects/Email'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>
  delete(id: string): Promise<void>
}
