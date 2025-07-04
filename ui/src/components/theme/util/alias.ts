import type {
  AliasToken,
  MapToken,
  OverrideToken,
  SeedToken,
} from "../interface";
import seedToken from "../themes/seed";

/** Raw merge of `@ant-design/cssinjs` token. Which need additional process */
type RawMergedToken = MapToken &
  OverrideToken & { override: Partial<AliasToken> };

/**
 * Seed (designer) > Derivative (designer) > Alias (developer).
 *
 * Merge seed & derivative & override token and generate alias token for developer.
 */
export default function formatToken(
  derivativeToken: RawMergedToken,
): AliasToken {
  const { override, ...restToken } = derivativeToken;
  const overrideTokens = { ...override };

  for (const token of Object.keys(seedToken)) {
    delete overrideTokens[token as keyof SeedToken];
  }

  const mergedToken = {
    ...restToken,
    ...overrideTokens,
  };

  const screenXS = 480;
  const screenSM = 576;
  const screenMD = 768;
  const screenLG = 992;
  const screenXL = 1200;
  const screenXXL = 1600;

  // Generate alias token
  const aliasToken: AliasToken = {
    ...mergedToken,

    screenXS,
    screenXSMin: screenXS,
    screenXSMax: screenSM - 1,
    screenSM,
    screenSMMin: screenSM,
    screenSMMax: screenMD - 1,
    screenMD,
    screenMDMin: screenMD,
    screenMDMax: screenLG - 1,
    screenLG,
    screenLGMin: screenLG,
    screenLGMax: screenXL - 1,
    screenXL,
    screenXLMin: screenXL,
    screenXLMax: screenXXL - 1,
    screenXXL,
    screenXXLMin: screenXXL,

    // Override AliasToken
    ...overrideTokens,
  };
  return aliasToken;
}
