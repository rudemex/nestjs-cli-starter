<div align="center">
    <img alt="nestjs-starter" width="250" height="auto" src="https://raw.githubusercontent.com/rudemex/nestjs-cli-starter/master/.readme-static/logo-nestjs.svg" />
    <h1>NestJS CLI Starter</h1>
</div>

<p align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.19.3&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.2.0&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.5&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/>
    <a href="https://github.com/rudemex/nestjs-cli-starter/releases/latest">
        <img alt="Last Release" src="https://img.shields.io/github/v/tag/rudemex/nestjs-cli-starter?label=release">
    </a>
    <a href="./license.md">
        <img alt="GitHub license" src="https://img.shields.io/github/license/rudemex/nestjs-cli-starter?style=flat">
    </a>
    <br>
    <a href="https://github.com/rudemex/nestjs-cli-starter/actions/workflows/master.yml" target="_blank">
        <img alt="GitHub Workflow Status" src="https://github.com/rudemex/nestjs-cli-starter/actions/workflows/master.yml/badge.svg?branch=master">
    </a>
    <a href="https://app.codecov.io/gh/rudemex/nestjs-cli-starter/" target="_blank">
        <img alt="Codecov" src="https://img.shields.io/codecov/c/github/rudemex/nestjs-cli-starter?logoColor=FFFFFF&logo=Codecov&labelColor=#F01F7A">
    </a>
    <a href="https://sonarcloud.io/summary/new_code?id=rudemex_nestjs-cli-starter" target="_blank">    
        <img src="https://sonarcloud.io/api/project_badges/measure?project=rudemex_nestjs-cli-starter&metric=alert_status" alt="sonarcloud">
    </a>    
    <a href="https://snyk.io/test/github/rudemex/nestjs-cli-starter" target="_blank">
        <img src="https://snyk.io/test/github/rudemex/nestjs-cli-starter/badge.svg" alt="Snyk">
    </a>
    <br/> 
</p>

<p>Este proyecto es una base para desarrollar CLI (Command Line Interface) personalizadas utilizando <a href="https://nest-commander.jaymcdoniel.dev/" target="_blank"><b>nest-commander</b></a>. 
Está diseñado para agilizar el desarrollo de herramientas de línea de comandos con una arquitectura modular, extensible y desacoplada.<br>
<br>
Su base es <a href="https://nestjs.com/" target="_blank"><b>NestJS</b></a>, un framework progresivo de NodeJS que permite construir aplicaciones eficientes, 
confiables y escalables, combinando elementos de la programación orientada a objetos, funcional y reactiva. 
Gracias a su enfoque modular y su compatibilidad completa con TypeScript, NestJS resulta ideal para estructurar una CLI 
robusta, organizada y fácil de mantener.</p>

<br>
<div>
    <a href="https://www.buymeacoffee.com/rudemex" target="_blank">
        <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;" >
    </a>
</div>

## 📦 Características principales

- Comandos con subcomandos desacoplados de ejemplo
- Decoradores personalizados de `nest-commander`
- Uso de `inquirer`, `chalk`, `ora`, `cli-table3` y `update-notifier` para mejorar la experiencia de usuario
- Separación de lógica de interacción y lógica de negocio por cada comando
- Configuración persistente con `configstore`
- Configuración centralizada con `ConfigModule`

## Glosario

- [📝 Requisitos](#basic-requirements)
- [🛠️ Instalar dependencias](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [🚀 Probar la CLI localmente](#probar-la-cli-localmente)
- [💻 Scripts](#scripts)
- [📤 Commits](#commits)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](license.md)

---

<a name="basic-requirements"></a>

## 📝 Requisitos

- NodeJS ≥ 20.19.3 ([descargar](https://nodejs.org/es/download/))
- Yarn ≥ 1.22.22 o Npm ≥ 11.2.0
- NestJS ≥ v11.1.5 ([Documentación](https://nestjs.com/))


<a name="install-dependencies"></a>

## 🛠️ Instalar dependencias

```
yarn install
```

```
npm install
```

<a name="configurations"></a>

## ⚙️ Configuración

Este proyecto no utiliza archivos `.env`, ni `validationSchema`, toda la configuración a nivel CLI se carga en el archivo
`configuration.ts`, que luego es disponibilizado por el `ConfigModule` de NestJS para ser consumido en todo el proyecto 
por medio de la injection del `ConfigService`.

Por otro lado, también cuenta con la implementación de `Configstore`, que es para guardar configuración a nivel usuario,
como podría ser un token de authorization, un UID de usuario, etc.

Para cambiar el nombre del comando CLI que se ejecuta desde terminal, modificá el campo `bin` en el `package.json`:

```json
{
    //...
    "bin": {
      "nestjs-cli-starter": "dist/main.js"
    },
    //...
}
```

<a name="probar-la-cli-localmente"></a>

### 🚀 Probar la CLI localmente

Primero ejecutas el script `build:local`, una vez que finaliza el script, este se encarga de hacer ejecutable el bundle 
final con el script `postbuild` y luego lo linkea como paquete. 

Para probar el comando localmente debes ejecutar el comando en la terminal:

```shell
nestjs-cli-starter --help
```

En caso de que falle y no te reconozca el comando, es muy probable que tengas que instalarlo globalmente (unica vez),
y luego volver a realizar los pasos anteriores.

```shell
npm i -g .
```
```shell
yarn global add file:.
```

<a name="scripts"></a>

## 💻 Scripts

Realiza el build de la CLI

```
yarn build
```
```
npm run build
```

Hace que el bundle generado por el build sea ejecutable

```
yarn postbuild
```
```
npm run postbuild
```

Realiza el build de la CLI, lo transforma en ejecutable y lo linkea como paquete para probar localmente

```
yarn build:local
```
```
npm run build:local
```

Inicia los test con coverage

```
yarn test
```
```
npm run test
```

Des-linkea el paquete de npm

```
yarn unlink
```
```
npm run unlink
```

### Otros scripts

Formatea el código

```
yarn format
```
```
npm run format
```

Eslintea el código

```
yarn lint
```
```
npm run lint
```

### 🧩 Diferencias entre Argumentos, Opciones y Flags

| Tipo          | ¿Qué es?                                                                                                         | Ejemplo CLI                                      |
|---------------|------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| **Argumento** | Valor posicional requerido u opcional para el comando.                                                           | `my-cli generate module auth`                    |
| **Opción**    | Parámetro con valor que modifica el comportamiento. Se pasa con `--clave`.                                       | `my-cli deploy --env production`                 |
| **Flag**      | Forma específica de escribir una opción, es decir, un parámetro booleano (encendido/apagado). No necesita valor. | `my-cli build --dry-run` <br/> `my-cli build -d` |

### 📌 Nomenclatura de uso

| Forma         | ¿Qué significa?               | Ejemplo                          | 
|---------------|-------------------------------|----------------------------------|
| `<valor>`     | Argumento obligatorio	        | `my-cli login <env>`             |
| `[valor]`     | Argumento opcional	           | `my-cli login [user]`            |
| `--flag`      | Opción sin valor (flag)       | `my-cli build --dry-run`         | 
| `--key <val>` | Opción con valor obligatorio	 | `my-cli deploy --env production` | 
| `--key [val]` | Opción con valor opcional	    | `my-cli deploy --env`            | 


<a name="commits"></a>

## 📤 Commits

Para los mensajes de commits se toma como
referencia [`conventional commits`](https://www.conventionalcommits.org/en/v1.0.0/#summary).

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

- **type:** chore, docs, feat, fix, refactor (más comunes)
- **scope:** indica la página, componente, funcionalidad
- **description:** comienza en minúsculas y no debe superar los 72 caracteres.

### Ejemplo

```
git commit -m "docs(readme): add documentantion to readme"
```

### Breaking change

```
git commit -am 'feat!: changes in application'
```

## 📄 Changelog

All notable changes to this project will be documented in [Changelog](./CHANGELOG.md) file.

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/rudemex/nestjs-cli-starter/master/.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤️</p>
</div>
