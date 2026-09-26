import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        classificationmge: path.resolve(__dirname, "classificationmge/index.html"),
        mapping: path.resolve(__dirname, "mapping/index.html"),
        mappingDictionaries: path.resolve(__dirname, "mapping/dictionaries/index.html"),
        mappingIfcClasses: path.resolve(__dirname, "mapping/ifc-classes/index.html"),
        idsConverter: path.resolve(__dirname, "ids-converter/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
