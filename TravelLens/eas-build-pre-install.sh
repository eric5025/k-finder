#!/bin/bash

# EAS Build에서 환경 변수를 .env 파일로 생성
set -e  # 에러 발생 시 스크립트 중단

echo "🔍 환경 변수 확인 중..."

# 환경 변수 확인
if [ -z "$PERPLEXITY_API_KEY" ]; then
  echo "❌ PERPLEXITY_API_KEY가 설정되지 않았습니다."
  exit 1
fi

if [ -z "$GOOGLE_WEB_CLIENT_ID" ]; then
  echo "❌ GOOGLE_WEB_CLIENT_ID가 설정되지 않았습니다."
  exit 1
fi

if [ -z "$GOOGLE_IOS_CLIENT_ID" ]; then
  echo "❌ GOOGLE_IOS_CLIENT_ID가 설정되지 않았습니다."
  exit 1
fi

# .env 파일 생성
echo "PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}" > .env
echo "GOOGLE_WEB_CLIENT_ID=${GOOGLE_WEB_CLIENT_ID}" >> .env
echo "GOOGLE_IOS_CLIENT_ID=${GOOGLE_IOS_CLIENT_ID}" >> .env

if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
  echo "GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}" >> .env
  echo "✓ GOOGLE_MAPS_API_KEY 추가됨"
fi

echo "✓ .env 파일 생성 완료"
echo "✓ PERPLEXITY_API_KEY: ${PERPLEXITY_API_KEY:0:20}..."
echo "✓ GOOGLE_WEB_CLIENT_ID: ${GOOGLE_WEB_CLIENT_ID:0:20}..."
echo "✓ GOOGLE_IOS_CLIENT_ID: ${GOOGLE_IOS_CLIENT_ID:0:20}..."

