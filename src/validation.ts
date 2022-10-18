import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import { Newtype, iso } from 'newtype-ts'
import { match, P } from 'ts-pattern'
import * as D from 'fp-ts/Date'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/function'

type UndefineError = Readonly<{ _tag: 'UndefineError'; msg: string }>
const undefineErrorOf: (msg: string) => UndefineError = (msg) => ({ _tag: 'UndefineError', msg })
type NotMaleError = Readonly<{ _tag: 'NotMaleError'; msg: string }>
type NotFemaleError = Readonly<{ _tag: 'NotFemaleError'; msg: string }>
const notFemaleErrorOf: (msg: string) => NotFemaleError = (msg) => ({ _tag: 'NotFemaleError', msg })
type GenderError = NotMaleError | NotFemaleError
type AgeError = Readonly<{ _tag: 'AgeError'; msg: string }>
const ageErrorOf: (msg: string) => AgeError = (msg) => ({ _tag: 'AgeError', msg })
type Error = UndefineError | GenderError | AgeError

const valueValidation = E.getApplicativeValidation(A.getSemigroup<Error>())
//    ^?

interface FirstName extends Newtype<{ readonly FirstName: unique symbol }, string> {}
interface LastName extends Newtype<{ readonly LastName: unique symbol }, string> {}
interface BirthYear extends Newtype<{ readonly BirthYear: unique symbol }, number> {}
const isoBirthYear = iso<BirthYear>()
//    ^?

type Male = Readonly<{ _tag: 'Male'; firstName: FirstName; lastName: LastName; birthYear: BirthYear }>
//   ^?
type Female = Readonly<{ _tag: 'Female'; firstName: FirstName; lastName: LastName; birthYear: BirthYear }>
//   ^?
type Person = Male | Female

const isFemale: (p: Person) => E.Either<Error, Person> = (p) =>
  match(p)
    .with({ _tag: 'Female' }, (p) => E.right(p))
    .with({ _tag: 'Male' }, (p) => E.left(notFemaleErrorOf(`${p.firstName} ${p.lastName} is not a female.`)))
    .with(P.union(null, undefined), (_) => E.left(undefineErrorOf('The given person is either `undefined` or `null`')))
    .exhaustive()

// TODO: still some side effect to deal with
const isOldEnough: (age: number) => (p: Person) => E.Either<Error, Person> = (age) => (p) =>
  match(p)
    .with(P.union(null, undefined), (_) => E.left(undefineErrorOf('The given person is either `undefined` or `null`')))
    .with(P.union({ _tag: 'Male' }, { _tag: 'Female' }), (p) =>
      pipe(
        new Date().getFullYear() - isoBirthYear.unwrap(p.birthYear) > age,
        B.fold(
          () => E.left(ageErrorOf(`${p.firstName} ${p.lastName} is not older than ${age}`)),
          () => E.right(p)
        )
      )
    )
    .run()
