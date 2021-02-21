# About SecurePaste

SecurePaste is designed to do 2 things:
- Send pretty documents! Code, calenders or fully-formatted documents.
- Keep your data safe

SecurePaste does this by encoding your data into your shareable URL. This means that:  
- The server hosting SecurePaste cannot read / access any of your data
- Your data cannot be censored / expire / be deleted from SecurePaste
- Your data will be available forever
- Optionally, encode your data so only users with the password can access it

# Check it out! 
[SecurePaste inception](https://choonkiatlee.github.io/securepaste/?CeBeJxdUTtPwzAQ3vMrPtQFpBYkRjbUESQQjwEhhqt9aSwcX+RzKPn3nAuUlM323ff0AtcbGQse2Y2Z70kLN83sgqDwrGGb2KMIvOASpQtpq1fNymDJY8hcymQjN/acip5gLZ6XcBRtzFkhGe0Y47RqJfdUinEdts+N5oZ5wCRjhqdCUGr/ufDCWmUVmwmcnHhzMEOEZN72V+0oM20i4/nh9hxPFdMzpQqncgWY3FPHUM4fnNGJlko1F3OUkhQYjccFyDlWBaUJ0v5JGs3LQf4HsTEsJ5XMFcifQ8hsB3v2HLmmbrP0R13PWXYhxrpMHxTiPoLVxebStu6GEiSRdbj8zs/zvgSS4oRRa9m7UDoLyxhIdSfZV3u/MUJpmgXWHbt3O8O+/gTN69GHJ8d7sbfT5uwLENG9vA==)

# Running instructions:

- Install:
```bash
npm run install
```

- Build Project:
```bash
npm run build
```

- Regenerate Project for Github (incl. updating the github pages docs/ folder):
```bash
npm run publish
```

# Notes: 
- First 2 characters in the message are the __shortmode__ codes. This encodes a mode (i.e. how should we display the data? Markdown? Python? etc.) as a 2 character string. (`src/editorconfig.ts`).
- 3rd character is used to indicate if the message is encrypted(`A`) or unencrypted(`B`)
- Other characters used to encode the message.
- Encrypting a message has a certain overhead. (Possible feature: prettier statistics about the output size: how many bytes for control chars, how many bytes for encryption overhead, how many bytes for actual compressed output etc.)
- Due to typing issues, need to add `_container: HTMLElement;` to the `UI` interface object in `node_modules/@toast-ui/editor/index.ts`. Extremely ugly ><