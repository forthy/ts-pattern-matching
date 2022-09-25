import { match, P } from 'ts-pattern'
import * as E from 'fp-ts/Either'

type Door = 2 | 4 | 5
type Car = { _tag: 'Car'; door: Door }
type Colour = 'Red' | 'Yellow' | 'White' | 'Black'
type Bicycle = { _tag: 'Bicycle'; colour: Colour }

type Vehicle = Car | Bicycle

type Email = string & { _tag: 'Email' }
//   ^?

const carOf: (door: Door) => Readonly<Car> = (door) => ({ _tag: 'Car', door })

const bicycleOf: (colour: Colour) => Readonly<Bicycle> = (colour) => ({
  _tag: 'Bicycle',
  colour,
})

const aCar = carOf(5)
const aBicycle = bicycleOf('Yellow')

const msg = match<Vehicle, string>(aCar)
  .with({ _tag: 'Car', door: 5 }, () => 'This is a 5-door car')
  .with(
    { _tag: 'Car', door: P.select() },
    (door) => `This car has ${door} door(s)`
  )
  .with(
    { _tag: 'Bicycle', colour: P.select() },
    (c) => `This bicycle is in ${c.toLowerCase()} colour`
  )
  .exhaustive()

console.log(msg)

type SayMsgCommand = { _tag: 'SayMsgCommand'; msg: string }

type FirstName = { _tag: 'FirstName', name: string }
type LastName = { _tag: 'LastName', name: string }
type Person = { firstName: FirstName; lastName: LastName }
const personOf: (firstName: FirstName) => (lastName: LastName) => Person =
  (firstName) => (lastName) => ({ firstName, lastName })

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
