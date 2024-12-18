/* eslint-disable no-use-before-define */
declare namespace google {
    namespace translate {
      class TranslateElement {
        constructor(options: TranslateElementOptions, containerId: string);
      }
  
      interface TranslateElementOptions {
        pageLanguage: string;
        includedLanguages?: string;
        layout?: number;
        autoDisplay?: boolean;
      }
    }
  }
  