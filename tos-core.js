import { normalize } from './rate-core.js?v=calculator-preview-1';
export function tosModel(site = {}) {
  const fallback = {
    version: 4,
    title: 'TOS',
    sections: [
      {
        id: 'tos-main',
        name: '',
        blocks: [
          {
            id: 'tos-text',
            kind: 'text',
            text: (site.terms || [])
              .map((t) => [t.thTitle || t.enTitle, t.th || t.en].filter(Boolean).join('\n'))
              .filter(Boolean)
              .join('\n\n'),
          },
        ],
      },
    ],
  };
  const model = normalize({ priceRate: site.tosContent || fallback });
  model.title = 'TOS';
  return model;
}
