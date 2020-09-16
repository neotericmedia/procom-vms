export enum OrganizationContactColumnsKey {
  Name = <any>'Contact/FullName',
  Profile = <any>'ProfileTypeId',
  ProfilePrimaryEmail = <any>'PrimaryEmail',
  Status = <any>'ProfileStatusId'
}

export enum OrganizationAdvanceColumnsKey {
  Id = <any>'Id',
  Description = <any>'Description',
  AmountInitial = <any>'AmountInitial',
  PaidAmount = <any>'PaidAmount',
  PaybackRemainder = <any>'PaybackRemainder',
  AdvanceStatusId = <any>'AdvanceStatusId',
}

export enum OrganizationGarnisheeColumnsKey {
  Id = <any>'Id',
  Description = <any>'Description',
  PayAmountMaximum = <any>'PayAmountMaximum',
  PaidAmount = <any>'PaidAmount',
  PaybackRemainder = <any>'PaybackRemainder',
  GarnisheeStatusId = <any>'GarnisheeStatusId',
  PayAmountIsMaximum = <any>'PayAmountIsMaximum',
  CurrencyId = <any>'CurrencyId'
}
