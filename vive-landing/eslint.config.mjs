import next from "eslint-config-next";

const config = [...next, { ignores: [".next/**", "node_modules/**", "scripts/**", "review/**"] }];
export default config;
