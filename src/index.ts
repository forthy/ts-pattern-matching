import * as E from 'fp-ts/Either'

export type Door = 2 | 4 | 5
export type Car = { _tag: 'Car'; door: Door }
export type Colour = 'Red' | 'Yellow' | 'White' | 'Black'
export type Bicycle = { _tag: 'Bicycle'; colour: Colour }

export type Vehicle = Car | Bicycle

export const carOf: (door: Door) => Readonly<Car> = (door) => ({ _tag: 'Car', door })
export const bicycleOf: (colour: Colour) => Readonly<Bicycle> = (colour) => ({
  _tag: 'Bicycle',
  colour,
})

type SayMsgCommand = { _tag: 'SayMsgCommand'; msg: string }

// newtype
type FirstName = string & { _tag: 'FirstName' }
const firstNameOf: (firstName: string) => FirstName = (firstName) => firstName as FirstName
type LastName = string & { _tag: 'LastName' }
const lastNameOf: (lastName: string) => LastName = (lastName) => lastName as LastName
type Person = { firstName: FirstName; lastName: LastName }
const personOf: (firstName: FirstName) => (lastName: LastName) => Readonly<Person> = (firstName) => (lastName) => ({ firstName, lastName })

type CreatePersonCommand = {
  _tag: 'CreatePersonCommand'
  data: { firstName: FirstName; lastName: LastName }
}
type SayMsgError = { _tag: 'SayMsgError'; msg: string }
type CreatePersonError = { _tag: 'CreatePersonError'; msg: string }
type Error = SayMsgError | CreatePersonError
type Command = SayMsgCommand | CreatePersonCommand

type Action<T> = (cmd: Command) => E.Either<Error, T>
//                     ^?
