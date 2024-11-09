import fs from 'fs'
import path from 'path'

const copyFile = (target, linkPath) => {
  if (fs.existsSync(linkPath)) {
    fs.unlinkSync(linkPath)
  }

  try {
    fs.copyFileSync(target, linkPath)
  } catch (error) {
    console.error(`Failed to copy file: ${error.message}`)
  }
}

const getModules = () => {
  const modulesDir = path.resolve('modules')
  return fs.readdirSync(modulesDir)
    .filter(name => fs.statSync(path.join(modulesDir, name)).isDirectory())
    .filter(name => name.startsWith('module-'))
}

const getPrismaSchemas = (moduleName) => {
  const schemasDir = path.resolve('modules', moduleName, 'impl-prisma/schemas')

  if (!fs.existsSync(schemasDir)) {
    return []
  }

  return fs.readdirSync(schemasDir)
    .filter(file => file.endsWith('.prisma'))
    .map(file => ({
      source: path.resolve(schemasDir, file),
      name: file
    }))
}

const prismaDir = path.resolve('prisma/schema')

if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true })
}

const modules = getModules()

modules.forEach(moduleName => {
  const schemas = getPrismaSchemas(moduleName)

  schemas.forEach(({ source, name }) => {
    const targetName = `${moduleName}_${name}`
    copyFile(
      source,
      path.resolve(prismaDir, targetName)
    )
  })
})