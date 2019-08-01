// an instance of this is created in our auth middleware in order to hold
// the decoded JWt before placing it in our request objects
export interface DecodedJwt
{
    _userId: number,
    email: string
}