import { carOf, bicycleOf, Vehicle } from '../src/index'
import { match, P } from 'ts-pattern'
import { describe, expect, it } from 'vitest'

describe('Test ts-pattern', () => {
  it('Match vehicles', () => {
    const aCar = carOf(5)
    const aBicycle = bicycleOf('Yellow')

    const msg: (v: Vehicle) => string = (v) =>
      match<Vehicle, string>(v)
        .with({ _tag: 'Car', door: 5 }, () => 'This is a 5-door car')
        .with({ _tag: 'Car', door: P.select() }, (door) => `This car has ${door} door(s)`)
        .with({ _tag: 'Bicycle', colour: P.select() }, (c) => `This bicycle is in ${c.toLowerCase()} colour`)
        .exhaustive()

    expect(msg(aCar)).toEqual('This is a 5-door car')
    expect(msg(aBicycle)).toEqual('This bicycle is in yellow colour')
  })
})
