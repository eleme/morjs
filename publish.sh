# NOTE: 这个脚本仅用于 lerna 发布失败之后，手动发布用
# 正常发布请不要使用这个脚本，使用 README.md 里面的说明的发布方式
#
# 用法：
#   发布指定的库 ./publish.sh cli core
#   或直接使用 ./publish.sh 根据提示输入要发布的库
#   发布全部库 ./publish.sh all

# 记录当前目录
CWD=`pwd`

ALL_PACKAGES=`ls packages`

# 优先从命令行读取
SELECTED_PACKAGES=$@

# 如果命令行没有输入
if [[ $SELECTED_PACKAGES == "" ]]
then
  echo '请输入要发布的包名，使用空格分隔，如要发布所有库，请输入 all: '
  read SELECTED_PACKAGES
fi

# 如果选择所有
if [[ $SELECTED_PACKAGES == "all" ]]
then
  SELECTED_PACKAGES=$ALL_PACKAGES
fi

# 未输入
if [[ $SELECTED_PACKAGES == "" ]]
then
  echo "未选择任何 package，请检查输入"
fi

# 发布已选择的 packages
for package in $SELECTED_PACKAGES
do
  # echo $package
  # 忽略 example 相关库
  if [[ $package == "create-mor" ]]
  then
    echo "$package 为 示例库，跳过"
  else
    packageDir="$CWD/packages/$package"

    # 检查目录是否存在
    if [[ -d $packageDir ]]
    then
      echo "\n================== 发布 $package 中 ==================\n"

      # 进入库中
      cd $packageDir

      # 发布
      npm publish
    else
      echo "$package 不存在，已跳过，请检查输入"
    fi

    echo "\n"
  fi
done
