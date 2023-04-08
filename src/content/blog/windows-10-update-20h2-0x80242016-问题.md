---
title: 'windows 10 update 20h2 0x80242016 问题'
pubDate: '2021-04-07 23:01:28'
description: 'windows 10 0x80242016 解决方式'
tags: ['windows10', 'problem', '技术']
---

## 启因
在折腾wsl2的时候想准备把windows升级到最新版本，使用`updates`来更新，但是就是不成功。在windows updates中的安装历史中一直显示如下内容
> Feature Update to Windows 10, version 20H2 has failed to installed 6 times.  
    Last failed install attempted on MM/DD/YYY - 0x80242016".

由于我之前的windows是在1909的版本，这个版本是包含了wsl2的内容。当时一心弄wsl2的就暂时搁置升级，放在哪儿不管了。

随着wsl2的折腾完了，升级这个的事情我都忘记了。突然有一天windows自动更新了。但是又失败了。看着这失败次数到达6次之多，就想下手彻底解决这个问题。

## 解决方案

在网上找了一圈这个错误，并没有啥具体的解决方案，所以打算使用windows的易升，也就是更新助手。直接在windows官方[下载](https://www.microsoft.com/zh-cn/software-download/windows10)使用即可, 操作步骤简单按照提示来就行。

一顿操作但是对于我来说并不启作用，还是失败。准备使用万能的修电脑三连（重启、重装、重买）。准备进行重装，直接在官网下载制作U盘安装。在下载制作的途中，看着我重装要后要处理的一堆东西有点不甘心。搭上梯子上google搜索一番找找和baidu上不同的答案。搜索到一个一模一样的[提问](https://answers.microsoft.com/en-us/windows/forum/windows_10-update/windows-10-feature-update-20h2-consistently-fails/65d93edb-6423-43cd-a140-a3c847066380)，我顿时来了精神，一看多大5页的讨论。花了点时间大概看来一遍，看到一条很关键的讨论回复
> I have the same problem induced by transfering the windows10 from HDD to SDD disk, during the transfer the WinRE partition was lost!

意思是迁移过系统盘到ssd，导致winRE部分丢失。正好我前段时间也是更换了ssd，我意识到这应该就是我的答案了。而且他还提供了详细的修复步骤，步骤如下

1. Boot from Windows 10 installation disc and press any key to continue.  
通过安装盘启动，刚刚好前面做好了u盘，直接进入bios设置u盘启动

2. Then navigate to Repair your computer->Troubleshoot->Advanced options->Command Prompt.  
进入安装页面，先是选择一些语言啥的，直接下一步，在左下角有个修计算机的选项，点击进入->选择疑难解答->命令行提示符

3. Type diskpart in the command prompt.  
在命令行输入`diskpart`

4. Type the following command and press Enter after each command.  
跟着下面的操作步骤

        List disk
        Sel disk 0 (where 0 stands for the boot drive)
        List vol (note which volume is the EFI partition, mine is 4)
        Sel vol 4
        assign letter=N:
        Exit
        Step 5. Type N: (the drive letter you just assigned and hit Enter.)

        list disk -> 显示出系统上的磁盘
        sel disk * -> 把*更换成你的系统安装所在的磁盘
        list vol -> 显示出磁盘上的卷
        sel vol * -> 把*更换为你卷上EFI分区的卷
        assign letter=N: -> 将N设置为刚刚选择的EFI分区卷，这里你自己控制可以用其他为其他字母
        exit -> 退出diskpart模式
    

6. After you have assigned a drive letter Using Diskpart, you can format the EFI partition using the following command.  
格式化刚刚创建的卷
                
        format N: /FS:FAT32

7. Now, type bcdboot C:\windows /s N: /f UEFI and hit Enter. This command will repair your Bootloader.(My windows are located in D:\windows)  
使用命令修复UEFI,使用的时候具体你windows在那个盘就用那个盘，刚刚创建的卷是哪个就输入哪个。比如我的windows在C:刚刚创建的卷为N: 我使用的命令如下

        bcdboot C:\windows /s N: /f UEFI

完成上面步骤的操作后尝试使用 `bootrec /fixboot`来进行修复。

所有操作完成退出u盘的启动引导，更换为刚刚创建的引导。重启之后进入windows update让他自动升级。升级成功！！！


