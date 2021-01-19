# 用 Deno 编写一个简单的 REST API

> 过去一年，[Deno](https://deno.land/) 和 [Svelte](https://svelte.dev/) 获得了 2020 年的[年度突破奖](https://osawards.com/javascript/2020), Deno 作为明日之星的项目，目前生态还不是很完善，和一言不合就造轮子的大佬相比，作为代码搬砖界的小丑 -- Copy攻城狮便只能简单记录下自己的学习历程，今天想分享的是如何使用 Deno 编写一个简单的 REST API。

## 目标

- 熟悉 Deno 的安装
- 熟悉 Deno 指令
- 熟悉 Deno 简单开发

## 安装及配置

具体的安装及配置可参考官方文档： [deno.land](https://deno.land/#installation), 社区的安装教程可以说是非常丰富了，这里推荐 justjavac 的镜像站点：[x.deno.js.cn](https://x.deno.js.cn/)。如需通过官网安装，可将地址替换为`https://deno.land/x/install/`:

```bash
# 安装最新版
## 使用 Shell:
curl -fsSL https://x.deno.js.cn/install.sh | sh

## 使用 PowerShell:
iwr https://x.deno.js.cn/install.ps1 -useb | iex

# 安装某个特定版本
## 使用 Shell:
curl -fsSL https://x.deno.js.cn/install.sh | sh -s v1.0.0

## 使用 PowerShell:
$v="1.0.0"; iwr https://x.deno.js.cn/install.ps1 -useb | iex

# 验证安装
deno --version

```

如我获得的输出为：
```
deno 1.6.3 (release, x86_64-unknown-linux-gnu)
v8 8.8.294
typescript 4.1.3
```



## deno help

`help` 真的是个神奇的指令，介绍了很多关键的信息，在 Linux 中，`help`指令是Shell内建指令，用于显示 shell 内部指令的帮助信息。Deno 中也实现了 help 指令，我们在终端输入`deno help` 或者`deno --help`，亦或是更简单的`deno -h`,我们便能获得大量的信息帮助我们熟悉和使用 Deno,包括简介、文档地址、使用方法等等：

![deno help](https://gitee.com/hu-qi/cdn/raw/master/2021-1-18/1610945036066-image.png)

```log
root:~/deno# deno help
deno 1.6.3
A secure JavaScript and TypeScript runtime

Docs: https://deno.land/manual
Modules: https://deno.land/std/ https://deno.land/x/
Bugs: https://github.com/denoland/deno/issues

To start the REPL:
  deno

To execute a script:
  deno run https://deno.land/std/examples/welcome.ts

To evaluate code in the shell:
  deno eval "console.log(30933 + 404)"

USAGE:
    deno [OPTIONS] [SUBCOMMAND]

OPTIONS:
    -h, --help                     打印帮助信息
    -L, --log-level <log-level>    设置日志级别[可选的值：debug，info]
    -q, --quiet                    禁止诊断输出
        --unstable                 启用不稳定的功能和 API
    -V, --version                  打印版本信息

SUBCOMMANDS:
    bundle         将模块和依赖项捆绑到单个文件中
    cache          缓存依赖项
    compile        将脚本编译成一个自包含的可执行文件
    completions    生成 shell 自动补全
    doc            显示指定模块的文档
    eval           Eval 脚本
    fmt            格式化源码脚本
    help           打印此帮助信息或给定子命令的帮助信息
    info           显示有关缓存的信息或与源文件相关的信息e
    install        将脚本安装为可执行文件
    lint           检查代码源文件
    lsp            启动语言服务器
    repl           进入交互式模式
    run            运行给定模块文件名或 url 的程序，使用“-”作为从 stdin 读取的文件名。
    test           运行测试
    types          打印运行时 TypeScript 声明
    upgrade        将 deno 可执行文件升级到给定版本

ENVIRONMENT VARIABLES:
    DENO_DIR             设置缓存目录
    DENO_INSTALL_ROOT    设置 deno 安装的输出目录
                         (默认是 $HOME/.deno/bin)
    DENO_CERT            从 PEM 编码文件加载证书颁发机构
    NO_COLOR             设置为禁用颜色
    HTTP_PROXY           HTTP请求的代理地址
                         (downloads, fetch 模块)
    HTTPS_PROXY          HTTPS请求的代理地址
                         (downloads, fetch 模块)
    NO_PROXY             不使用代理的主机，以逗号分隔列表
                         (downloads, fetch 模块)
```

更详细的指令请参考 @[hylerrix](https://github.com/hylerrix) 的 [从 CLI 指令通读 Deno v1.x 全特性](https://juejin.cn/post/6857058738046861320)，我个人比较感兴趣的是 **lsp**, 欢迎一起探讨！

## JUST DO IT

读书破万卷不如行千里路，马上开始我们的探索 Deno 之路。先来一个最简单的目录:
```
.
├── mod.ts            // 入口文件
├── caseItem.ts       // 接口
├── controller.ts     // 控制器
├── db.ts             // mock 数据
└── routes.ts         // 路由
```

先不管都要填充些啥代码，我们动手把坑挖好，里面就跳！
```bash
mkdir deno-simple-api
cd deno-simple-api
touch mod.ts
touch caseItem.ts
touch controller.ts
touch db.ts
touch routes.ts
```

在 `mod.ts` 中我们使用 `oak` 开启一个服务：

```
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
 
const app = new Application();
const router = new Router();
const port: number = 8080;
 
router.get("/", ({ response }: { response: any }) => {
   response.body = {
     message: "Hallo Deno!",
   };
});
 
app.use(router.routes());
app.addEventListener("listen", ({ secure, hostname, port }) => {
   const protocol = secure ? "https://" : "http://";
   const url = `${protocol}${hostname ?? "localhost"}:${port}`;
   console.info(
     `Listening on ${url}`
   );
});
 
await app.listen({ port });
```
执行`deno run --allow-net mod.ts` 然后再访问`http://localhost:8080` 便能看到网页显示`{"message":"Hallo Deno!"}`。

其中
```
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
```
这行代码 Deno 通过URL导入模块，首先会检查本地是否已经存在该模块。如果没有，则转至url `https://deno.land/x/oak/mod.ts`，然后下载该依赖包并将其缓存以备将来使用。这是由于 Deno 将下载的模块存储在缓存中，并在下次运行时使用此缓存，这不仅速度更快，而且在离线时也可以使用该模块。
此时，当我们不带参数执行`deno run mod.ts`，Deno 会提示我们没有权限：
```
Download https://deno.land/x/oak/mod.ts
Warning Implicitly using latest version (v6.4.1) for https://deno.land/x/oak/mod.ts
Check file:///Users/gpdi/Documents/huqi/deno/deno-simple-api/mod.ts
error: Uncaught PermissionDenied: network access to "0.0.0.0:8080", run again with the --allow-net flag
    at processResponse (deno:core/core.js:223:11)
    at Object.jsonOpSync (deno:core/core.js:246:12)
    at opListen (deno:runtime/js/30_net.js:28:17)
    at Object.listen (deno:runtime/js/30_net.js:191:17)
    at Application.serve (server.ts:301:25)
    at Application.listen (application.ts:362:20)
    at mod.ts:22:11
```

这是Deno的安全功能之一：默认情况下，对主机系统重要组件（例如网络）的访问受到限制，您必须授予Deno显式权限。可能的标志选择如下：
```
-A，--allow -all 允许所有权限。这将禁用所有安全性。
--allow-env 允许环境访问，例如获取和设置环境变量。
--allow-hrtime 允许高分辨率时间测量。高分辨率时间可用于定时攻击和指纹识别。
--allow-net=<网址白名单> 允许网络访问。您可以指定一个可选的，用逗号分隔的域列表，以提供允许域的允许列表。
--allow-plugin 允许加载插件。请注意这是一个不稳定的功能。
--allow-read=<文件白名单> 允许文件系统读取访问。您可以指定目录或文件的可选逗号分隔列表，以提供允许的文件系统访问的允许列表。
--allow-run 允许运行子进程。请注意，子流程未在沙箱中运行，因此没有与 deno 流程相同的安全限制。慎用！
--allow-write=<文件白名单> 允许文件系统写访问。您可以指定目录或文件的可选逗号分隔列表，以提供允许的文件系统访问的允许列表
```

接着我们**建立模型** ,在 `caseItem.ts`中写入：
```
export default interface CaseItem {
   id: string;
   user_name: string;
   company: string;
   description: string | null;
};
```
此处建立的是伪用户模型，包含用户ID`id`、用户名`user_name`、公司`company`、描述`description`这四个字段。

再然后我们模拟下一数据，假装来自数据库,新建 `db.ts`
<details>
  <summary>db.ts</summary>
  <pre><code>
    import CaseItem from "./caseItem.ts";
    const db: Array<CaseItem> = [{
      id: "940837680722589",
      user_name: "稀土君",
      company: "稀土",
      description: "挖掘最优质的互联网技术 https://juejin.cn ，经常搞活动搞抽奖，快关注快关注",
    }, {
      id: "2330620350708823",
      user_name: "sh_晨曦时梦见兮",
      company: "",
      description: "",
    }, {
      id: "2955079655898093",
      user_name: "大帅_全能老猿",
      company: "花果山",
      description: "Stay Hungry, Stay Foolish.",
    }];
    export default db;
  </code></pre>
</details>


接着我们创建**控制器**实现 CURD ，新建`controller.ts`:
<details>
  <summary>controller.ts</summary>
  <img src="https://gitee.com/hu-qi/cdn/raw/master/2021-1-19/1611035368378-Untitled.jpeg" />
</details>

最后创建路由并注册:
  - `route.ts`
  ```
  import { Router } from 'https://deno.land/x/oak/mod.ts';
  import { getUserItems, addUserItem, getUserItem, updateUserItem, deleteUserItem } from './controller.ts';

  const router = new Router();

  router
  .get('/users', getUserItems)
  .post('/users', addUserItem)
  .get('/users/:id', getUserItem)
  .put('/users/:id', updateUserItem)
  .delete('/users/:id', deleteUserItem);

  export default router;
  ```
- `mod.ts`
  ```
  import { Application, Router } from "https://deno.land/x/oak/mod.ts";
  import router from './routes.ts';

  const app = new Application();
  const port: number = 8080;

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.addEventListener("listen", ({ secure, hostname, port }) => {
     const protocol = secure ? "https://" : "http://";
     const url = `${protocol}${hostname ?? "localhost"}:${port}`;
     console.info(
       `Listening on ${url}`
     );
  });

  await app.listen({ port });
  ```

接下来我们使用 REST Client 来调试上面创建的 CURD 接口。

## 使用 [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

这并不是 Deno 的相关知识，只是为了我们更方便地调试 API，REST Client允许您发送HTTP请求并直接在Visual Studio Code中查看响应。在 Visual Studio Code 中安装 REST Client 拓展此处就不表了，安装和使用都很便捷。使用时只需新建`.http`或者`.rest`为后缀的文件，编写请求格式的代码即可，如下图中，只需在`api.http`中写入`GET http://localhost:8080`,点击`Send Request`即可发起一次请求：

![REST Client](https://gitee.com/hu-qi/cdn/raw/master/2021-1-19/1611021407416-image.png)

接着我们编写上面实现的 CRUD 接口调试脚本, `api.http`:
  
```
  @baseUrl = http://localhost:8080

  ### 问候
  GET {{baseUrl}}

  ### 获取所有
  GET {{baseUrl}}/users

  ### 新增用户
  POST {{baseUrl}}/users
  content-type: application/json

  {
      "id": "1028798612771239",
      "user_name": "胡琦",
      "company": "公众号： 胡琦",
      "description": "前端打杂"
  }

  ### 指定 id 获取
  GET {{baseUrl}}/users/1028798612771239


  ### 更新用户
  PUT {{baseUrl}}/users/1028798612771239
  content-type: application/json
  
  {
      "description": "Copy Code, Copy World!"
  }

  ### 删除用户
  DELETE  {{baseUrl}}/users/1028798612771239

```

- 首先查看下`db.ts` 中的所有用户：
  
  ![REST Client](https://gitee.com/hu-qi/cdn/raw/master/2021-1-19/1611036646495-image.png)

- 接着新增一条用户信息，返回`"message": "OK"`,再查看一下所有用户，发现我被加入到了用户列表中：
  ![REST Client](https://gitee.com/hu-qi/cdn/raw/master/2021-1-19/1611036836179-image.png)

- 在然后更新一下我的 slogan，**Copy Code, Copy World!**，再查看一下，更新成功！：
  
  ![REST Client](https://gitee.com/hu-qi/cdn/raw/master/2021-1-19/1611036984493-image.png)

- 最后再测试一下删除接口，我被彻底“干掉”了，用户列表又恢复了往日的平静，大佬们依旧谈笑风生，而我，似乎从来没有来过：
  
  ![REST Client](https://gitee.com/hu-qi/cdn/raw/master/2021-1-19/1611037123017-image.png)
  
## 小结
  
源码地址： [https://github.com/hu-qi/deno-simple-api](https://github.com/hu-qi/deno-simple-api)

一直纠结要不要写这么水的文章，犹豫过，徘徊过，怀疑过，最终写战胜了不写。谨以此文悼念逝去的岁月，愿暮年他日还能所有回忆！

欢迎各位大佬多多指教！
