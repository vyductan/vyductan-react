import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  Transformer,
} from '@lexical/markdown'

import { EMOJI } from '../transformers/markdown-emoji-transformer'
import { EQUATION } from '../transformers/markdown-equation-transofrmer'
import { HR } from '../transformers/markdown-hr-transformer'
import { IMAGE } from '../transformers/markdown-image-transformer'
import { TABLE } from '../transformers/markdown-table-transformer'
import { TWEET } from '../transformers/markdown-tweet-transformer'

export const MARKDOWN_TRANSFORMERS: Array<Transformer> = [
  TABLE,
  HR,
  IMAGE,
  EMOJI,
  EQUATION,
  TWEET,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]
