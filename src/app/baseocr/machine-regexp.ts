class Tester {

  mrzregex = `^
  (?<FirstLine>
    # First line capturing group
    (?<Passport>P)
    # Passport character capturing group (P char, length 1)
    (?<PassportType>.)
    # Passport Type (any char, generally <, length 1)
    (?<IssuingCountry>[IND]{3})
    # To be completed with the ISO 3166-1 alpha-3 country codes (length 3)
    # Or in alternative it can be checked for char only as
    # (?<IssuingCountry>[A-Z<]{3}) if check state not necessary
    (?=[A-Z<]{39})
    # Passport lookahead for lenght validation -- NOT WORKING
    (?<Surname>[A-Z]+)
    # Surname, it has to be followed by <<
    <<
    (?<GivenName>
      # Given Name
      (?:[A-Z]+<?)+
    )
    [<]+
  )
  \n
  (?<SecondLine>
    # Second Line capturing group
    (?<PassportNumber>[A-Z0-9<]{9})
    # Passport number, length 9, padded with <
    (?<CheckDigit19>[0-9]{1})
    # Check digit for position 1 to 9
    (?<Nationality>\g{IssuingCountry})
    # Nationality, follows the same rule as match group 4
    (?<DoB>
      # Date Of Birth
      (?<DoBYear>[0-9]{2})
      (?<DoBMonth>(?:0[1-9]|1[0-2]))
      (?<DoBDay>(?:0[1-9]|(?:1|2)[0-9]|3[01])
      )
    )
    (?<CheckDigit1419>[0-9])
    # Check digit for position 14 to 19
    (?<Sex>[MFT<])
    # Sex (Male, Female, Transgender)
    (?<Expiral>
      # Expiral date
      (?<ExpiralYear>[0-9]{2})
      (?<ExpiralMonth>(?:0[1-9]|1[0-2]))
      (?<ExpiralDay>(?:0[1-9]|(?:1|2)[0-9]|3[01]))
    )
    (?<CheckDigit2227>[0-9])
    # Check digit for position 22 to 27
    (?<PersonalNumber>[A-Z0-9<]{14})
    # Personal number padded with <
    (?<CheckDigit2942>[0-9<])
    # Check digit for position 29 to 42 (can be < empty)
    (?<CheckDigitF>[0-9])
    # Check digit
  )$`

}
