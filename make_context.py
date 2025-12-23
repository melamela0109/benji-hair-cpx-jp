import os

# 1. 합칠 파일의 확장자 설정 (필요한 것만 남기세요)
EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md'}

# 2. 제외할 폴더 이름 설정 (매우 중요!)
IGNORE_DIRS = {'node_modules', '.git', 'build', 'dist', '.firebase', 'coverage'}

# 3. 제외할 파일 이름 설정
IGNORE_FILES = {'package-lock.json', 'yarn.lock', 'make_context.py', '.DS_Store'}

def merge_files(output_filename='project_code.txt'):
    root_dir = os.getcwd() # 현재 폴더 기준
    
    with open(output_filename, 'w', encoding='utf-8') as outfile:
        # 폴더 탐색
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # 제외할 폴더 건너뛰기
            dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
            
            for filename in filenames:
                # 확장자 확인 및 제외 파일 확인
                ext = os.path.splitext(filename)[1]
                if ext in EXTENSIONS and filename not in IGNORE_FILES:
                    file_path = os.path.join(dirpath, filename)
                    relative_path = os.path.relpath(file_path, root_dir)
                    
                    try:
                        # 파일 구분선 및 경로 기록
                        outfile.write(f"\n{'='*50}\n")
                        outfile.write(f"FILE_PATH: {relative_path}\n")
                        outfile.write(f"{'='*50}\n\n")
                        
                        # 파일 내용 읽어서 쓰기
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read())
                            outfile.write("\n")
                            
                        print(f"✅ 추가됨: {relative_path}")
                        
                    except Exception as e:
                        print(f"⚠️ 에러 발생 ({relative_path}): {e}")

    print(f"\n🎉 완료! '{output_filename}' 파일이 생성되었습니다.")
    print("이 파일을 AI에게 업로드하세요.")

if __name__ == "__main__":
    merge_files()