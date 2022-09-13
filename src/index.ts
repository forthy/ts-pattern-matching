import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { match, P } from 'ts-pattern'
import { cons } from 'fp-ts/lib/ReadonlyNonEmptyArray'

type Door = 2 | 4 | 5
type Car = { _tag: 'Car'; door: Door }
type Colour = 'Red' | 'Yellow' | 'White' | 'Black'
type Bicycle = { _tag: 'Bicycle'; colour: Colour }

type Vehicle = Car | Bicycle

const carOf: (door: Door) => Readonly<Car> = (door) => ({ _tag: 'Car', door })

const bicycleOf: (colour: Colour) => Readonly<Bicycle> = (colour) => ({
  _tag: 'Bicycle',
  colour,
})

const aCar = carOf(4)
const aBicycle = bicycleOf('Yellow')

const msg = match<Vehicle, string>(aBicycle)
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
