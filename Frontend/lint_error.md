# Linting Error and Fix

## Error

When running `npm run lint`, the following error occurred in `src/jest.setup.js` and `src/setupTests.js`:

```
/home/lokeshbabu_nalluri7878/ECOMMERCE-/Frontend/src/jest.setup.js
  3:1  error  Expected indentation of 2 spaces but found 4  indent
  4:1  error  Expected indentation of 4 spaces but found 6  indent
  5:1  error  Expected indentation of 6 spaces but found 8  indent
  6:1  error  Expected indentation of 4 spaces but found 6  indent
  7:1  error  Expected indentation of 2 spaces but found 4  indent
  8:1  error  Expected indentation of 2 spaces but found 4  indent
  9:1  error  Expected indentation of 0 spaces but found 2  indent

/home/lokeshbabu_nalluri7878/ECOMMERCE-/Frontend/src/setupTests.js
   8:1  error  Expected indentation of 2 spaces but found 4  indent
   9:1  error  Expected indentation of 4 spaces but found 6  indent
  10:1  error  Expected indentation of 6 spaces but found 8  indent
  11:1  error  Expected indentation of 4 spaces but found 6  indent
  12:1  error  Expected indentation of 2 spaces but found 4  indent
  13:1  error  Expected indentation of 2 spaces but found 4  indent
  14:1  error  Expected indentation of 0 spaces but found 2  indent
```

This error indicates that the indentation of the code in these files did not match the expected indentation of 2 spaces.

## Fix

The error was fixed by running the following command:

```
npm run lint -- --fix
```

This command automatically fixed the indentation issues in the files. The `npm run lint` command now runs without any errors.
