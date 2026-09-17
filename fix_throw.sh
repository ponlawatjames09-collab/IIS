sed -i '/console.error("fetchCMStatusRecords error:", error);/{n;s/return \[\];/throw error;/}' src/sheetsService.ts
