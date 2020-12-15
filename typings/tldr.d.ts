declare namespace Tldr {
  class Cache {
    constructor(config: Config);
    update(): Promise<unknown>;
    getPage(command: string): Promise<string>;
  }

  type Config = { [key: string]: string };

  interface Page {
    name: string;
    description: string;
    examples: [
      {
        description: string;
        code: string;
      },
    ];
  }
}

declare module 'tldr/lib/cache' {
  export = Tldr.Cache;
}

declare module 'tldr/lib/config' {
  export function get(): Tldr.Config;
}

declare module 'tldr/lib/parser' {
  export function parse(markdown: string): Tldr.Page;
}
