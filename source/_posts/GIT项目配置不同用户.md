---
title: GIT项目配置不同用户
date: 2023-03-19 14:30:33
tags: [git]
---



平时开发公司项目，也会在其他地方使用在GitHub、gitlab上等，去维护<del>拷贝</del>项目，或者自己乱写不成熟的项目提交代码。一般情况下，直接用下面的命令全局配置用户名。
```bash
git config --global user.name 法外狂徒张三
```
但是在维护公司的项目时，一般都怎么能随随便便的暴露这么中二的名字呢，通常都需要自己真实姓名方便查找，所以我们面临这个问题：不同的项目提交代码时，使用不同的用户名。

### 为项目单独配置
```bash
git config --local user.name 张三
git config --local user.email zhangsan@email.com
```
这种方式会在当前的git项目中的``.gitconfig``中生成，
```
[user]
  name = 张三
  email = zhangsan@email.com
```

### 批量配置
通常公司的项目都不会只有几个，有个十几甚至几十个项目的时候每个都这么操作就有点繁琐了，可以使用git的includeIf配置，实现某个目录下使用某个配置的方式。  
1. 假设公司的项目都在``/User/company/projects/``下面,那么我们可以在此目录下创建一个``.gitconfig``文件配置如下
    ```
    [user]
      name = 张三
      email = zhangsan@email.com
    ```
2. 修改全局的``.gitconfig``，通常这个配置文件路径一般都是``~/.gitconfig``。
    ```
    [includeIf "gitdir:/Users/company/projects/"]
      path = /Users/company/projects/.gitconfig
    ```

这样在projects这个路径下的所有项目，配置信息就直接使用projects/.gitconfig中的配置了。但是配置也有优先级。如果在项目自己的配置文件中已经有了用户名的配置，则优先使用项目自己的配置。如果项目没有单独配置，则再根据当前根路径是否指定了配置文件去获取对应的配置信息

