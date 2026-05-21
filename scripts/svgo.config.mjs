export default {
  multipass: true,
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeDesc',
    'removeUselessDefs',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    'mergeStyles',
    'minifyStyles',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'removeUnusedNS',
    'sortAttrs',
    {
      name: 'convertShapeToPath',
      params: { convertArcs: true },
    },
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-old-*'],
      },
    },
  ],
};
