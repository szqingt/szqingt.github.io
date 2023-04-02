---
title: 'wsl2 start vscode develop'
pubDate: '2021-04-07 23:01:2'
description: 'wsl2 vscode 开发方式'
tags: [wsl, ubuntu, vscode]
---

## WSL2 是啥
Windows Subststem for Linux 2 通过Hyper-V功能提供的Linux内核
通常我们在Windows中开发需要Linux环境都是安装虚拟机VMware，但是这种方式资源消耗大，运行效率低

## WSL2 安装

第一种：在Windows Insiders预览版本中安装非常的简单使用``wsl --install``即可
> 1.需要 build 20262或者更高   
  2.管理员的权限运行cmd

第二种：手动安装

下面的命令都需要在管理员权限下运行

1. 开启wsl的特性
> dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

2. 检查环境

	* x64 系统：版本 1903 或更高版本，以及内部版本 18362 或更高版本。
	* ARM64 系统：2004 或更高版本，内部版本19041或更高。
	* 低于18362 的内部版本不支持 WSL2。使用 Windows Update Assistant 来更新 Windows 版本。

3. 启用虚拟平台
> dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

4. 下载Linux Kernel更新包

	按照自己的系统选择
	[x64](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)和
	[arm64](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_arm64.msi)进行安装

5. 设置WSL2为默认版本
> wsl --set-default-version 2

6. 安装Linux

在商店可以找到一些Linux的版本，下载自己熟悉的，安装完成后使用在terminal中``wsl -list -verbose``可以查看安装的版本清单

## 使用vscode开始玩耍

最好不要直接使用windows中的文件进行开发性能很差，因为文件系统不一样。

先确定在win下已经安装好vscode，并且已经有环境变量code。
进入安装好的Linux系统中新建一个开发使用的文件夹。然后通过`code ./`进入开发，使用`Remote - WSL`插件成功体验在win下跟mac一般的vscode开发体验