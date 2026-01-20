

export default [
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      
      "no-console": "warn",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/", ".next/", "build/"],
  }
];
