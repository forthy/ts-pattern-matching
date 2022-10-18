import * as O from 'fp-ts/Option'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/function'
import * as S from 'fp-ts/string'
import * as A from 'fp-ts/Array'
import * as RA from 'fp-ts/ReadonlyArray'
import * as MT from 'monocle-ts/Traversal'
import * as ML from 'monocle-ts/Iso'
import * as MP from 'monocle-ts/Prism'
import { capitalize as capitalizeR } from 'radash'

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

const capitalize: (s: string) => string = (s) => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`

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

const capitaliseStrO: (str: string) => O.Option<string> = (str) =>
  pipe(
    O.fromNullable(str),
    O.map((s) => pipe(s, S.trim, capitalizeR))
  )

// DEBUG
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

// DEBUG
console.log(
  JSON.stringify(
    // changeNameFirstCharUppercaseL(employee),
    changeNameUppercaseL(employee),
    //  ^?
    null,
    2
  )
)

const streetNameOptional = companyL.compose(addressL).compose(streetL).compose(nameL).asOptional()
// const streetOptional = companyL.compose(addressL).compose(streetL).asOptional()

const employees = [employee, employee3, employee4]
const employeesTraverse = MT.fromTraversable(A.Traversable)<Employee>()
//    ^?
const changeNameUppercase = pipe(employeesTraverse, MT.composeOptional(streetNameOptional), MT.modify(capitaliseStr))
//                                                     ^?                        

console.log(`Employees: ${JSON.stringify(changeNameUppercase(employees), null, 2)}`)

// Iso
type Gender = 'Male' | 'Female'
type TCandidate = {
  _tag: 'Candidate'
  applicantId: string
  firstName: string
  lastName: string
  gender: Gender
}
const candidateOf: (applicantId: string) => (firstName: string) => (lastName: string) => (gender: Gender) => TCandidate =
  (applicantId) => (firstName) => (lastName) => (gender) => ({
    _tag: 'Candidate',
    applicantId,
    firstName,
    lastName,
    gender,
  })

type TEmployee = {
  _tag: 'Employee'
  employeeId: string
  firstName: string
  lastName: string
  gender: Gender
  onboardDate: Date
  spouse: O.Option<string>
}
const singleEmployeeOf: (
  employeeId: string
) => (firstName: string) => (lastName: string) => (gender: Gender) => (onboardDate: Date) => TEmployee =
  (employeeId) => (firstName) => (lastName) => (gender) => (onboardDate) => ({
    _tag: 'Employee',
    employeeId,
    firstName,
    lastName,
    gender,
    onboardDate,
    spouse: O.none,
  })

// ISO
type Person = TCandidate | TEmployee

const c2e: (employeeId: string) => (onboardDate: Date) => (candidate: TCandidate) => TEmployee = (eId) => (oDate) => (c) =>
  singleEmployeeOf(eId)(c.firstName)(c.lastName)(c.gender)(oDate)
const e2c: (applicantId: string) => (employee: TEmployee) => TCandidate = (aId) => (e) =>
  candidateOf(aId)(e.firstName)(e.lastName)(e.gender)

const candidateToEmployeeIso: (candidate: TCandidate) => (employee: TEmployee) => ML.Iso<TCandidate, TEmployee> = (c) => (e) =>
  ML.iso<TCandidate, TEmployee>(c2e(e.employeeId)(e.onboardDate), e2c(c.applicantId))

// Prism
const singleEmployeePrism = MP.fromPredicate<TEmployee>((e) => O.isNone(e.spouse))
//    ^?
console.log(
  JSON.stringify(singleEmployeePrism.getOption(singleEmployeeOf('117621')('John')('Doe')('Male')(new Date('2019-01-16'))), null, 2)
)
