var AuthenticationConfig = {};
AuthenticationConfig.vcap = '{ "SingleSignOn": [ \
    { \
      "name": "sso", \
      "label": "SingleSignOn", \
      "plan": "standard", \
      "credentials": { \
        "secret": "Y524I9tgDJ", \
        "tokenEndpointUrl": "https://ssoexp-ucv0ssb7w7-ct20.iam.ibmcloud.com/idaas/oidc/endpoint/default/token", \
        "authorizationEndpointUrl": "https://ssoexp-ucv0ssb7w7-ct20.iam.ibmcloud.com/idaas/oidc/endpoint/default/authorize", \
        "issuerIdentifier": "ssoexp-ucv0ssb7w7-ct20.iam.ibmcloud.com", \
        "clientId": "MkhWLHcwrP", \
        "serverSupportedScope": [ \
          "openid" \
        ] \
      } \
    } \
  ] \
}';
module.exports = AuthenticationConfig;