export interface Auth0User {
  sub: string; // Auth0 User ID (como 'auth0|...' o 'google-oauth2|...')
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  updated_at?: string;
  [key: string]: any; // Para otros claims personalizados
}
