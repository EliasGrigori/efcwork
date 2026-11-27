# Modelos de TESTE: cópia FIEL da etiqueta do EFClaudian (v2.102.60: etPadrao, ET_CAT e o CSS .etq), sem acrescentar nem tirar nada.
# Autorizado pelo Elias (27/11 11:3x: copiar o desenho da etiqueta do EFClaudian); regra de 27/11 13:50: nada inventado.
# - Cabeçalho: as duas faixas do EFClaudian, escritas no próprio modelo (ITEM 277, 27/11 14:29); aqui com texto de exemplo.
# - Linhas: as mesmas, na mesma ordem, "RÓTULO:" à esquerda (47%) e o valor à direita; valor que falta sai "-" (como no EFClaudian).
# - Cores e letras do CSS .etq: faixa 1 #C4D79B (Arial, negrito), faixa 2 #D8E4BC (serifada, negrito), linhas #EBF1DE (Cambria),
#   separadores brancos, contorno #B5CA8D. Folha: A4 deitada, margem de 6 mm, 3 × 4 etiquetas com 3 mm entre elas.
# Só para os testes e a página de aprovação; não entram no app. Levam a marca d'água MODELO NÃO OFICIAL · SÓ PARA TESTE.
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.drawing.image import Image as Img
BR, BR2, CT = Side(style='thin', color='FFFFFF'), Side(style='medium', color='FFFFFF'), Side(style='thin', color='B5CA8D')
def etiqueta(arq, linhas):
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = 'Etiqueta'
    ws.column_dimensions['A'].width = 23.6; ws.column_dimensions['B'].width = 26.6
    n = 2 + len(linhas)
    def borda(r, col, baixo):
        return Border(left=CT if col == 'A' else None, right=CT if col == 'B' else (BR2 if r > 2 else None), top=CT if r == 1 else None, bottom=CT if r == n else baixo)
    for r, texto, cor, fonte in [(1, 'Empresa (exemplo)', 'C4D79B', 'Arial'), (2, 'Local (exemplo)', 'D8E4BC', 'Cambria')]:
        ws.merge_cells(f'A{r}:B{r}')
        for col in 'AB':
            c = ws[f'{col}{r}']; c.fill = PatternFill('solid', fgColor=cor); c.border = borda(r, col, BR2)
        c = ws[f'A{r}']; c.value = texto; c.font = Font(name=fonte, bold=True, size=8.5); c.alignment = Alignment(horizontal='center', vertical='center')
        ws.row_dimensions[r].height = 11
    for i, (rot, campo) in enumerate(linhas):
        r = 3 + i
        a, b = ws[f'A{r}'], ws[f'B{r}']
        a.value = rot + ':'; a.font = Font(name='Cambria', bold=True, size=8); b.font = Font(name='Cambria', size=8)
        for col, x in (('A', a), ('B', b)): x.fill = PatternFill('solid', fgColor='EBF1DE'); x.alignment = Alignment(vertical='center'); x.border = borda(r, col, BR)
        wb.defined_names[f'efc_et_{campo}'] = DefinedName(f'efc_et_{campo}', attr_text=f"'Etiqueta'!$B${r}")
        ws.row_dimensions[r].height = 11
    # regra do Elias (27/11 14:00): todo modelo de teste leva marca d'água visível "MODELO NÃO OFICIAL · SÓ PARA TESTE"
    # (imagem por cima da etiqueta; os campos, a ordem e o desenho continuam iguais aos do EFClaudian)
    m = Img('marca-dagua-teste.png'); m.width, m.height = 330, 140; ws.add_image(m, 'A1')
    ws.page_setup.orientation = 'landscape'; ws.page_setup.paperSize = 9
    ws.page_margins.left = ws.page_margins.right = ws.page_margins.top = ws.page_margins.bottom = 6 / 25.4
    ws.print_area = f'A1:B{n}'
    wb.save(arq)
# etPadrao do EFClaudian, rótulos do ET_CAT
SOLO = [('MATERIAL', 'material'), ('ANÁLISE', 'analise'), ('CULTURA', 'cultura'), ('VARIEDADE', 'variedade'), ('TALHÃO', 'talhao'), ('PROFUNDIDADE', 'profundidade'),
        ('DATA COLETA', 'data'), ('RESPONSÁVEL PELA COLETA', 'responsavel'), ('ESTÁDIO FENOLÓGICO', 'estadio'), ('OBSERVAÇÕES', 'obs')]
FRUTA_COMPLETA = [('IDENTIFICAÇÃO DA AMOSTRA', 'identificacao'), ('ANÁLISE', 'analise'), ('CULTURA', 'cultura'), ('VARIEDADE', 'variedade'), ('TALHÃO', 'talhao'),
                  ('RASTREABILIDADE', 'rastreabilidade'), ('DATA COLETA', 'data'), ('HORA DA COLETA', 'hora'), ('RESPONSÁVEL PELA COLETA', 'responsavel'), ('OBSERVAÇÕES', 'obs')]
etiqueta('etiqueta-solo.xlsx', SOLO)
etiqueta('etiqueta-fruta.xlsx', FRUTA_COMPLETA)
