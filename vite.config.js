import {defineConfig} from 'vite';
import {fileURLToPath,URL} from 'node:url';
export default defineConfig({
 build:{rollupOptions:{input:{
  main:fileURLToPath(new URL('./index.html',import.meta.url)),
  ap04:fileURLToPath(new URL('./ap04.html',import.meta.url))
 }}}
});
