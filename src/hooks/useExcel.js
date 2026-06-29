import { useCallback } from "react";
import * as XLSX from "xlsx";
import { useApp } from "../context/AppContext";
import { parseExcelFile, exportToExcel, generateTemplateWorkbook } from "../lib/excel";

export function useExcel() {
  const { state, dispatch } = useApp();

  const importFile = useCallback(
    async (file) => {
      const data = await parseExcelFile(file);
      dispatch({
        type: "LOAD_FROM_EXCEL",
        payload: { ...data, fileName: file.name },
      });
    },
    [dispatch]
  );

  const exportFile = useCallback(() => {
    const fileName = state.fileName || "pengeluaran.xlsx";
    exportToExcel(state, fileName);
  }, [state]);

  const downloadTemplate = useCallback(() => {
    const wb = generateTemplateWorkbook();
    XLSX.writeFile(wb, "contoh-template.xlsx");
  }, []);

  return { importFile, exportFile, downloadTemplate };
}
