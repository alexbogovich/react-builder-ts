async function importModuleAsync(module: string) {
  switch (module) {
    case '@material-ui/core':
      return import('@material-ui/core')
    case 'redux':
      return import('redux')
    case 'react-redux':
      return import('react-redux')
    default:
      return import(`../../components/${module}`)
  }
}

export async function getObjectFromModule(
  module: string,
  objName = '',
  defaultImport = false
) {
  const loadedModule: any = await importModuleAsync(module)
  return defaultImport ? loadedModule.default : loadedModule[objName]
}
