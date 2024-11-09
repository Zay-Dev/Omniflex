export interface IHashProvider {
  hash(value: string): Promise<string>
  verify(value: string, hashedValue: string): Promise<boolean>
}