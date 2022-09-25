type Street = {
  num: number
  name: string
}
type Address = {
  city: string
  street: Street
}
type Company = {
  name: string
  address: Address
}
type Employee = {
  name: string
  company: Company
}

const employee: Employee = {
  name: 'john',
  company: {
    name: 'awesome inc',
    address: {
      city: 'london',
      street: {
        num: 23,
        name: 'high street',
      },
    },
  },
}

const employee3: Employee = {
  name: 'jane',
  company: {
    name: 'awesome inc',
    address: {
      city: 'london',
      street: {
        num: 23,
        name: 'high street',
      },
    },
  },
}

const employee4: Employee = {
  name: 'joe',
  company: {
    name: 'awesome inc',
    address: {
      city: 'london',
      street: {
        num: 23,
        name: 'high street',
      },
    },
  },
}

const capitalize: (s: string) => string = (s) =>
  `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`

const employee2 = {
  ...employee,
  company: {
    ...employee.company,
    address: {
      ...employee.company.address,
      street: {
        ...employee.company.address.street,
        name: capitalize(employee.company.address.street.name),
      },
    },
  },
}

import * as O from 'fp-ts/Option'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/function'
import * as S from 'fp-ts/string'
import * as A from 'fp-ts/Array'
import * as RA from 'fp-ts/ReadonlyArray'
import * as LT from 'monocle-ts/lib/Traversal'
import { capitalize as capitalizeR } from 'radash'

const capitaliseStrO: (str: string) => O.Option<string> = (str) =>
  pipe(
    O.fromNullable(str),
    O.map((s) => pipe(s, S.trim, capitalizeR))
  )

console.log(`Employee 2: ${JSON.stringify(employee2, null, 2)}`)

import { Lens, Optional } from 'monocle-ts'

const companyL = Lens.fromProp<Employee>()('company')
const addressL = Lens.fromProp<Company>()('address')
const streetL = Lens.fromProp<Address>()('street')
const nameL = new Lens<Street, string>(
  (s) => s.name,
  (a) => (s) => ({ ...s, name: a })
)
// const name = Lens.fromProp<Street>()('name')

const firstLetter = new Optional<string, string>(
  (s) =>
    pipe(
      s.length > 0,
      B.fold(
        () => O.none,
        () => O.some(s[0])
      )
    ),
  (a) => (s) => `${a}${s.substring(1)}`
)

const capitaliseStr: (str: string) => string = (s) =>
  pipe(
    s,
    S.trim,
    S.split(' '),
    RA.toArray,
    A.reduce(S.empty, (s1: string, s2: string) =>
      B.fold(
        () => `${s1} ${capitalizeR(s2)}`,
        () => capitalizeR(s2)
      )(s1 === S.empty)
    )
  )

const changeNameFirstCharUppercaseL: (employee: Employee) => Employee = companyL
  .compose(addressL)
  .compose(streetL)
  .compose(nameL)
  .asOptional()
  .compose(firstLetter)
  .modify((s) => s.toUpperCase())

const changeNameUppercaseL: (employee: Employee) => Employee = companyL
  .compose(addressL)
  .compose(streetL)
  .compose(nameL)
  .asOptional()
  .modify(capitaliseStr)

console.log(
  JSON.stringify(
    // changeNameFirstCharUppercaseL(employee),
    changeNameUppercaseL(employee),
//  ^?    
    null,
    2
  )
)

const employees = [employee, employee3, employee4]
const traverseUpperCaseNameT = LT.fromTraversable(A.Traversable)<Employee>()
//    ^?
const changeNameUppercase = pipe(
  traverseUpperCaseNameT,
  LT.modify(changeNameUppercaseL)
)

console.log(
  `Employees: ${JSON.stringify(changeNameUppercase(employees), null, 2)}`
)
