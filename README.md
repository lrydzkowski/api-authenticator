# api-authenticator

A console app generating an access token for APIs protected by OAuth 2.0 protocol.

## How to run it

```powershell
npm run generate-token -- `
  --config-file-path "./docs/sample-config-files/ad-client-credentials-test-config-with-secrets.json" `
  --env "App - local" `
  --add-prefix-to-output `
  --output-file-path "./docs/sample-output-files/settings-with-secrets.json" `
  --output-file-key "'rest-client.environmentVariables'.'{env}'.'bearerToken'" `
  --output-file-win-new-line-char
```
