echo "Did you run pnpm run build?"

rsync -avz --progress --delete-after ./dist/ antagonist:~/domains/uavtools.bartslinger.com/public_html/
