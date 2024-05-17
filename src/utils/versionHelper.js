export const updateVersion = (original, aprobe=false) => {
  const version = original.split('.')[0];
  const subversion = original.split('.')[1];

  return aprobe ? `${Number.parseInt(version) + 1}.0` : `${version}.${Number.parseInt(subversion) + 1}`
}