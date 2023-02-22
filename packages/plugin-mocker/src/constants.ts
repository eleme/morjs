import { zod as z } from '@morjs/utils'

export const COMMAND_NAME = 'mock'

export const MockerUserConfigSchema = z.object({
  mock: z
    .object({
      // 是否开启 debug (默认 false) 用于 attach 中打印信息
      debug: z.boolean().optional(),
      // mock 目录路径地址 (默认 './mock') 用于 initMockFileContent 中调用 require.context 获取目录下所有文件
      path: z.string().optional(),
      // 定义哪些 JsApi 强制使用原生接口 不需要 mock
      originMap: z.record(z.string(), z.array(z.string())).optional(),
      // adapters 扩展配置 支持 string [string] [string, Record<string, any>]
      adapters: z
        .array(
          z
            .string()
            .or(z.tuple([z.string(), z.record(z.string(), z.any())]))
            .or(z.tuple([z.string()]))
        )
        .optional()
    })
    .passthrough()
    .optional()
})

export type MockerUserConfig = z.infer<typeof MockerUserConfigSchema>
