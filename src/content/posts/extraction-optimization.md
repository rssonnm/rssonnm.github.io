---
title: "Tối ưu hoá điều kiện chiết xuất dược liệu"
date: 2026-08-11T14:00:00
description: "Bài viết dạy trọn một quy trình tối ưu hoá điều kiện chiết xuất dược liệu, tổ chức thành bốn tầng từ con số 0 đến trình độ nghiên cứu. Tầng 0: nền tảng toán cho người chưa biết gì (hàm số, đạo hàm, gradient, ma trận, Hessian, khai triển Taylor, trực giác về ràng buộc). Tầng 1: mô hình hoá hiệu suất bằng bề mặt đáp ứng bậc hai (RSM) — ước lượng hệ số bằng bình phương tối thiểu và lý thuyết thiết kế trung tâm tổ hợp (CCD). Tầng 2: giải và đọc nghiệm — phân loại bề mặt bằng phân tích chính tắc (trị riêng của ma trận B), điều kiện KKT kèm chứng minh tính đủ, giá bóng qua định lý vỏ bọc với kiểm chứng số. Tầng 3: trình độ nghiên cứu — độ nhạy Monte Carlo và khoảng tin cậy của nghiệm, quy trình thực hành hai giai đoạn với năm cạm bẫy định lượng, mở rộng đa mục tiêu và bền vững, giới hạn khi hàm thật không bậc hai. Ví dụ số xuyên suốt: cực đại hiệu suất flavonoid với ba biến nhiệt độ, nồng độ ethanol và thời gian; nghiệm (73,4 °C; 70%; 90 phút), hiệu suất 14,64 mg/g, giá bóng 0,057 và 0,040; mọi phép tính làm được bằng tay."
topic: mathematics
tags: [optimization, response-surface-methodology, kkt, design-of-experiments, shadow-price, extraction, phytochemistry, tutorial]
featured: false
draft: false
---

Chiết xuất là một quyết định kỹ thuật điển hình: chọn nhiệt độ, dung môi và thời gian để thu được nhiều hợp chất hoạt tính nhất trong giới hạn của thiết bị, chi phí và độ ổn định của chính hợp chất đó. Đây là một bài toán tối ưu có ràng buộc — và bài viết này dạy nó từ con số 0: không giả định người đọc đã biết đạo hàm, ma trận hay thống kê.

**Bản đồ bài viết — bốn tầng, từ con số 0 đến nghiên cứu.** Tầng 0 trang bị đúng lượng toán cần thiết: hàm số và đạo hàm, gradient của hàm nhiều biến, ma trận và Hessian, khai triển Taylor, và trực giác đầu tiên về bài toán có ràng buộc. Tầng một (Phần A, H) xây mô hình: bề mặt đáp ứng bậc hai nói gì, các hệ số đến từ đâu (bình phương tối thiểu trên thiết kế CCD). Tầng hai (Phần G, B, C) giải và đọc nghiệm: phân loại hình dạng bề mặt bằng trị riêng, điều kiện KKT với chứng minh tính đủ, giá bóng và định lý vỏ bọc. Tầng ba (Phần I, D, E, F) là trình độ nghiên cứu: độ bất định của nghiệm qua Monte Carlo, quy trình thực hành hai giai đoạn với năm cạm bẫy định lượng, mở rộng đa mục tiêu và bền vững, và giới hạn khi hàm thật không bậc hai. Các con số dưới đây là nghiệm của chính bài toán được phát biểu, mọi phép tính đều làm được bằng tay.

## Tầng 0 — Nền tảng: từ con số 0 đến công cụ tối ưu

Tầng này dành cho người chưa từng học giải tích hay đại số tuyến tính. Mục tiêu: đọc xong, mọi ký hiệu của bài viết — đạo hàm, gradient, ma trận, Hessian, Taylor, ràng buộc — đều có một hình ảnh trong đầu. Mỗi khái niệm được gắn ngay với bài toán chiết xuất để không phải học "trừu tượng".

### 0.1 Hàm số và đạo hàm — ngôn ngữ của sự thay đổi

**Hàm số** là một quy tắc biến đầu vào thành đầu ra. Với bài toán của ta: $Y = f(T)$ nghĩa là "nếu chạy chiết ở nhiệt độ $T$, thu được hiệu suất $Y$". Vẽ lên giấy, mỗi cặp $(T, Y)$ là một điểm; nối các điểm đo lại được một đường cong. Hàm số là mô tả toán học của đường cong đó.

**Đạo hàm** $f'(T)$ trả lời câu hỏi: đang chạy ở $T$, nếu tăng thêm một đơn vị thì $Y$ thay đổi bao nhiêu — ngay tại điểm đó, không phải trung bình trên cả dải. Về hình học, $f'(T)$ là độ dốc của tiếp tuyến với đường cong tại $T$. $f' > 0$: đường cong đang đi lên (tăng $T$ thì tăng $Y$); $f' < 0$: đang đi xuống. Với $Y = 9{,}2 + 0{,}30(T-60)$, đạo hàm là hằng số $0{,}30$: mỗi °C thêm vào tăng hiệu suất 0,30 mg/g ở mọi nơi — đường thẳng, không có đỉnh.

**Đạo hàm bậc hai** $f''(T)$ là tốc độ thay đổi của độ dốc — độ cong của đường cong. $f'' < 0$: độ dốc giảm dần, đường cong uốn xuống (hình nón ngược — có đỉnh). $f'' > 0$: uốn lên (hình lòng chảo — có đáy).

**Cực đại.** Tại đỉnh, đường cong không đi lên cũng không đi xuống: $f'(T) = 0$. Điểm thoả $f' = 0$ gọi là **điểm dừng**; nếu $f'' < 0$ tại đó thì là cực đại, nếu $f'' > 0$ thì là cực tiểu. Với parabola $Y = a + bT + cT^2$: đỉnh tại $T^* = -b/(2c)$. Thử bằng số: $Y = 9{,}2 + 0{,}30(T-60) - 0{,}014(T-60)^2$ có $T^* = 60 + 0{,}30/(2 \cdot 0{,}014) = 60 + 10{,}7 = 70{,}7$ °C. Toàn bộ bài viết — vì sao nghiệm nằm sát 75 °C, vì sao các hệ số cong quyết định độ cao đỉnh — bắt đầu từ phép tính parabola này.

### 0.2 Hàm nhiều biến, đạo hàm riêng và gradient

Thực tế có ba biến: $Y = f(T, C, t)$. Không vẽ được đồ thị 4 chiều, nhưng vẽ được **đường mức** (contour): trên mặt phẳng $(T, C)$, mỗi đường nối các điểm cho cùng một $Y$ — giống bản đồ địa hình, mỗi đường là một "cao độ".

**Đạo hàm riêng** $\partial Y/\partial T$: giữ $C$ và $t$ cố định, chỉ cho $T$ thay đổi, rồi đo độ dốc theo hướng $T$. Nó trả lời: "tăng $T$ thêm 1 °C, giữ nguyên mọi thứ khác, thì $Y$ đổi bao nhiêu". Tương tự $\partial Y/\partial C$ và $\partial Y/\partial t$: ba con số, mỗi con số một hướng.

**Gradient** gộp ba đạo hàm riêng thành một vector:
$$\nabla Y = \left(\frac{\partial Y}{\partial T}, \frac{\partial Y}{\partial C}, \frac{\partial Y}{\partial t}\right).$$
Gradient chỉ **hướng tăng nhanh nhất** của $Y$ tại điểm đang xét, và độ dài của nó là tốc độ tăng theo hướng đó. Hình ảnh: đứng trên sườn đồi, nhìn quanh — hướng nào dốc lên nhiều nhất, đó là hướng của gradient. **Điều kiện dừng** $\nabla Y = 0$ nghĩa là cả ba đạo hàm riêng cùng bằng 0: đứng trên đỉnh (hoặc đáy, hoặc yên ngựa — phân biệt ở mục sau).

### 0.3 Ma trận, dạng toàn phương và Hessian

**Vector** là một danh sách số có thứ tự; **ma trận** là một bảng số. Ma trận $B$ nhân với vector $u$ "trộn" các thành phần của $u$ theo luật: thành phần thứ $i$ của $Bu$ là tổng theo $j$ của $B_{ij}u_j$.

**Dạng toàn phương** $u^\top B u$ (với $B$ đối xứng, tức $B_{ij} = B_{ji}$) khai triển thành
$$u^\top B u = \sum_i B_{ii} u_i^2 + 2\sum_{i<j} B_{ij} u_i u_j.$$
Nó là một con số đo "độ cong của hàm theo hướng $u$": số hạng chéo $B_{ii}u_i^2$ là độ cong dọc trục $i$, số hạng chéo phụ $2B_{ij}u_iu_j$ là phần cong "xoắn" do hai biến tương tác.

**Hessian** của một hàm nhiều biến là ma trận các đạo hàm bậc hai. Với mô hình bậc hai $Y = \beta_0 + b^\top u + u^\top B u$, Hessian là hằng số $2B$ — độ cong không đổi trên toàn miền, đó là đặc trưng của hàm bậc hai.

Dấu của $u^\top B u$ quyết định hình dạng: nếu $u^\top B u < 0$ cho mọi $u \neq 0$ (ma trận **âm xác định**), hàm lõm — một đỉnh duy nhất, và điểm dừng là cực đại toàn cục; nếu luôn dương, hàm lồi — một đáy; nếu đổi dấu theo hướng, bề mặt là **yên ngựa**. Tiêu chuẩn gọn nhất dùng **trị riêng** của $B$: mọi trị riêng âm — cực đại; mọi trị riêng dương — cực tiểu; trái dấu — yên ngựa. Trị riêng là "độ cong theo các hướng chính", và Phần G dùng chính tiêu chuẩn này.

### 0.4 Khai triển Taylor — vì sao "mô hình bậc hai"

Với hàm một biến trơn, quanh điểm $x_0$:
$$f(x) \approx f(x_0) + f'(x_0)(x - x_0) + \tfrac{1}{2} f''(x_0)(x - x_0)^2,$$
và phần bỏ đi — các số hạng bậc ba trở lên — là nhỏ khi $x$ gần $x_0$.
Đây là **khai triển Taylor**: mọi hàm trơn đều xấp xỉ cục bộ bằng một đa thức bậc hai, và các hệ số của đa thức chính là các đạo hàm tại $x_0$. Bậc hai là bậc thấp nhất "biết cong" — đủ để bắt một đỉnh. Đó là lý do "mô hình bậc hai" không phải giả định tuỳ tiện: nó là xấp xỉ Taylor bậc hai, đúng cho mọi quá trình trơn trong lân cận đủ nhỏ. Và việc **tâm hoá** (đặt $u = T - 60$ thay vì dùng $T$) chính là chọn $x_0$ là tâm miền, để các hệ số khớp với đạo hàm tại đúng nơi dữ liệu được đo — chi tiết ở Phần A.

### 0.5 Tối ưu có ràng buộc — trực giác đầu tiên

Không ràng buộc: chỉ việc leo đến đỉnh đồi tự do ($\nabla Y = 0$). Có ràng buộc ($T \le 75$, $C \le 70$, $t \le 90$): đỉnh tự do có thể nằm **ngoài** vùng cho phép — khi đó nghiệm là điểm trên biên của vùng, "tựa" vào một hay nhiều ràng buộc. Hình ảnh: quả bóng trên mái vòm đặt trong một căn phòng; nếu đỉnh vòm nằm ngoài phòng, bóng không lăn tới đỉnh mà dừng ở chỗ tựa vào tường. Câu hỏi tự nhiên tiếp theo: nới bức tường ra một chút thì bóng lăn cao thêm bao nhiêu? Đó chính là **giá bóng** — nội dung của Phần B và Phần C.

Tầng 0 kết thúc ở đây. Từ giờ mọi ký hiệu trong bài viết đều có nghĩa; Phần A bắt đầu xây mô hình cho bài toán chiết xuất.

## Phần A — Mô hình hoá bài toán chiết xuất

```definition[Bài toán chiết xuất]
Một mẻ chiết xuất được xác định bởi $n$ biến quyết định $x \in \mathbb{R}^n$: nhiệt độ, nồng độ dung môi, thời gian, tỉ lệ dung môi/nguyên liệu. Hiệu suất thu hồi $Y(x)$ là đáp ứng cần cực đại, và các ràng buộc $g_i(x) \le 0$ mô tả giới hạn vận hành: nhiệt độ tối đa trước khi hợp chất phân huỷ, chi phí dung môi, ngân sách thời gian, công suất thiết bị. Bài toán:
$$\max_x \; Y(x) \quad \text{s.t.} \quad g_i(x) \le 0 \ (i = 1, \ldots, m), \quad x_{\min} \le x \le x_{\max}.$$
```

```definition[Bề mặt đáp ứng bậc hai]
Thực nghiệm cho thấy hiệu suất chiết thường có một đỉnh trong miền khả thi: tăng nhiệt độ đẩy nhanh quá trình truyền khối nhưng quá ngưỡng thì phân huỷ hợp chất; tăng dung môi tốt cho hoà tan nhưng kém chọn lọc và đắt. Mô hình chuẩn để bắt đỉnh đó là đa thức bậc hai:
$$Y(x) = \beta_0 + \sum_i \beta_i x_i + \sum_i \beta_{ii} x_i^2 + \sum_{i<j} \beta_{ij} x_i x_j,$$
gọi là **bề mặt đáp ứng (response surface)**. Các hệ số được ước lượng từ một thiết kế thực nghiệm, thường là thiết kế trung tâm tổ hợp (central composite design): các điểm sao, điểm tâm và điểm giai thừa.
```

### Kiến thức nền tảng — mô hình bậc hai nói gì

Đọc Definition 2 cần ba ý nền, tất cả đều kiểm chứng được bằng tay.

**Một là, "mô hình" nghĩa là gì.** Không có công thức của tự nhiên cho hiệu suất chiết: quan hệ giữa $Y$ và ba biến là một hàm số ta không biết, chỉ đo được ở vài điểm. Một **mô hình** là một khuôn dạng — một họ hàm số chứa vài con số chưa biết gọi là **hệ số** (coefficient), ký hiệu $\beta$. Các chữ $\beta_0, \beta_i, \beta_{ii}, \beta_{ij}$ trong công thức không phải là công thức: chúng là những ô trống mà thực nghiệm sẽ điền số vào. Với bài flavonoid ở ví dụ dưới, các ô đó được điền $\beta_0 = 9{,}2$, $\beta_u = 0{,}30$, v.v.

**Hai là, vì sao lại chọn đa thức bậc hai.** Lý do sâu xa là khai triển Taylor (Tầng 0, mục 0.4): mọi hàm trơn đều xấp xỉ cục bộ được bởi một đa thức, và bậc hai là bậc thấp nhất "biết cong". Hàm bậc nhất $Y = \beta_0 + \beta_1 T$ là một đường thẳng — không thể có đỉnh. Muốn hiệu suất tăng rồi giảm, đường cong phải uốn xuống, và parabola $Y = \beta_0 + \beta_1 T + \beta_{11} T^2$ là dạng đơn giản nhất làm được điều đó. Đỉnh của parabola nằm tại $T^* = -\beta_1/(2\beta_{11})$; khi $\beta_{11} < 0$ đó là một cực đại. Bậc ba trở lên uốn phức tạp hơn nhưng cần nhiều dữ liệu hơn và hiếm khi được biện minh ở đây — bậc hai là điểm cân bằng mặc định.

**Ba là, đọc từng loại số hạng.** Bốn nhóm:

- $\beta_0$: giá trị của $Y$ khi mọi biến bằng 0. Với toạ độ tâm hoá (ví dụ dưới), đó chính là hiệu suất tại tâm miền.
- $\beta_i x_i$: số hạng tuyến tính — tốc độ thay đổi của $Y$ theo $x_i$ tại điểm tham chiếu (độ dốc). $\beta_i > 0$: tăng $x_i$ thì $Y$ tăng lúc đầu; $\beta_i < 0$: ngược lại.
- $\beta_{ii} x_i^2$: độ cong. $\beta_{ii} < 0$: lợi ích của $x_i$ bão hoà dần và có đỉnh; $\beta_{ii} > 0$: tăng nhanh dần, không có đỉnh trong miền.
- $\beta_{ij} x_i x_j$: **tương tác** — hiệu quả của $x_i$ phụ thuộc vào mức của $x_j$. $\beta_{ij} > 0$: hai biến hỗ trợ nhau (nồng độ ethanol càng cao thì nhiệt độ càng có lợi); $\beta_{ij} < 0$: chúng triệt tiêu nhau. Đây là thứ mô hình tuyến tính không bao giờ mô tả được.

```remark[Minh hoạ một biến]
Nếu chỉ còn nhiệt độ, mô hình là $Y = 9{,}2 + 0{,}30u - 0{,}014u^2$ với $u$ là độ lệch quanh tâm (định nghĩa đầy đủ ở ví dụ dưới). Tại $u = 0$: $Y = 9{,}2$, độ dốc $0{,}30$. Độ dốc giảm dần theo $u$: tại $u = 10$ còn $0{,}30 - 2 \cdot 0{,}014 \cdot 10 = 0{,}02 \approx 0$ — đường cong vừa đạt đỉnh. Đỉnh chính xác tại $u^* = 0{,}30/(2 \cdot 0{,}014) \approx 10{,}7$, tức $T \approx 70{,}7$ °C. Toàn bộ câu chuyện của bài viết — vì sao nghiệm nằm sát 75 °C, vì sao các hệ số bậc hai quyết định mọi thứ — bắt đầu từ phép tính parabola này.
```

Đọc lại Definition 2 với ba ý trên: công thức là khuôn bậc hai, các $\beta$ là ô trống chờ dữ liệu điền, số hạng bậc hai là cơ chế tạo đỉnh, số hạng tương tác là cách hai biến ảnh hưởng lẫn nhau. Ví dụ dưới đây điền số vào từng ô.

Mô hình bậc hai do Box và Wilson [^1] đề xuất cùng phương pháp leo dốc nhất trong thực nghiệm; trình bày đầy đủ của phương pháp bề mặt đáp ứng ở Myers, Montgomery và Anderson-Cook [^2], còn lý thuyết thiết kế thí nghiệm ở Montgomery [^6].

```example[Mô hình cụ thể: chiết xuất flavonoid]
Xét chiết xuất flavonoid từ một dược liệu với ba biến quyết định: nhiệt độ $T$ (°C), nồng độ ethanol $C$ (%), thời gian $t$ (phút). Trước hết là **biên vật lý** — dải giá trị mà thiết bị và nguyên liệu cho phép vận hành: $T \in [40, 80]$, $C \in [30, 80]$, $t \in [30, 120]$. Đây không phải điều kiện ta chọn mà là giới hạn của chính hệ thống: dưới 40 °C thiết bị không đạt nhiệt, trên 80 °C dược liệu cháy xém; ngoài [30, 80]% ethanol không còn là pha chiết mong muốn; và mỗi ca vận hành không kéo dài quá 120 phút. Ngoài miền này mô hình không có ý nghĩa vì chưa từng đo ở đó.

**Toạ độ tâm hoá.** Điểm giữa của miền thực nghiệm là $(T, C, t) = (60, 55, 75)$ — trung bình của từng khoảng. Thay vì đo $T$ tuyệt đối, ta đo độ lệch khỏi điểm giữa đó:
$$u = T - 60, \qquad v = C - 55, \qquad w = t - 75.$$
Vậy $u = 10$ nghĩa là "nhiệt độ 70 °C — cao hơn điểm giữa miền 10 °C", $u = -5$ nghĩa là "55 °C — thấp hơn điểm giữa 5 °C", còn $u = 0$ chính là tâm miền:

| $T$ (°C) | 40 | 60 | 80 |
|---|---|---|---|
| $u = T - 60$ | −20 | 0 | +20 |

Vì sao lại chọn điểm giữa làm gốc? Trước hết, dời gốc **không hề thay đổi bề mặt**: $u = T - 60$ chỉ là đổi điểm mốc đo, như đo độ cao so với mực nước biển hay so với sân nhà — ngọn núi vẫn y nguyên, chỉ số 0 đổi chỗ. Cùng một bề mặt, cùng đỉnh, cùng nghiệm tối ưu ở Phần B; chỉ có cách đọc các con số trong mô hình thay đổi.

Và đó chính là điểm cốt lõi: **với toạ độ tâm hoá, mỗi hệ số là một đạo hàm của hàm thật tại tâm**. Viết khai triển Taylor quanh tâm $T_0 = 60$:
$$Y(T) \approx Y(T_0) + Y'(T_0)\,(T - T_0) + \tfrac{1}{2}Y''(T_0)\,(T - T_0)^2,$$
đối chiếu với mô hình $Y = \beta_0 + \beta_1 u + \beta_{11}u^2$ (với $u = T - 60$) cho:
$$\beta_0 = Y(T_0), \qquad \beta_1 = Y'(T_0), \qquad \beta_{11} = \tfrac{1}{2}Y''(T_0).$$
Nghĩa là: $\beta_0$ là chính hiệu suất tại tâm, $\beta_1$ là độ dốc thật của bề mặt ngay tại tâm, $\beta_{11}$ là nửa độ cong tại tâm. Với ba biến, ba hệ số tuyến tính $0{,}30$, $0{,}26$, $0{,}10$ chính là ba thành phần của gradient $\nabla Y$ tại tâm — trả lời trực tiếp câu hỏi "đẩy mỗi biến lên một chút quanh tâm thì Y tăng bao nhiêu". Mô hình nói về đúng nơi dữ liệu được đo, và đúng nơi nó đáng tin nhất.

**Hệ số hằng là gì.** Trong mô hình $Y = \beta_0 + \beta_1 u + \beta_{11}u^2$, hệ số hằng $\beta_0$ là giá trị mô hình dự đoán khi mọi biến bằng 0 — chỗ đường cong cắt trục tung, còn gọi là tung độ gốc (intercept). Điều quan trọng cần thấy: $\beta_0$ không phải là thông số vật lý của quá trình chiết, nó là **thuộc tính của hệ toạ độ** — gốc đặt ở đâu, $\beta_0$ là giá trị dự đoán tại đúng gốc đó. Với toạ độ tâm hoá, gốc $u = 0$ chính là tâm miền (60 °C, 55 %, 75 phút), một điểm thật đã chạy trong thiết kế, nên $\beta_0 = 9{,}2$ mg/g đọc được ngay: "hiệu suất dự đoán tại tâm". Còn $\beta_1$ là độ dốc tại gốc: vì $u = T - 60$ nên $\beta_1 = Y'(60)$ — độ dốc thật của bề mặt ngay tại tâm, chứ không phải ở đâu xa.

Nếu không tâm hoá, gốc rơi về $T = 0$ °C — điểm cách điểm đo gần nhất 40 độ, nằm xa ngoài miền vật lý [40, 80], chưa bao giờ chạy, và trên hết, **số 0 của thang Celsius chỉ là quy ước** (nước đóng băng), không liên quan gì đến phản ứng chiết. Khi đó $\beta_0$ trở thành "hiệu suất dự đoán tại 0 °C", $\beta_1$ thành độ dốc tại 0 °C — những con số do hệ toạ độ sinh ra, không phải do dữ liệu; đổi sang thang Fahrenheit, mọi hệ số lại thành con số khác dù bề mặt không đổi. Phép khớp không tệ hơn chút nào — cùng bề mặt, cùng $R^2$, cùng dự đoán trong [40, 80] — chỉ có cách đọc từng hệ số là vỡ tan.

**Vấn đề thứ hai là số học, không chỉ cách đọc.** Trên các điểm thiết kế, hai cột $T$ và $T^2$ cùng tăng gần như song song: tương quan giữa chúng khoảng 0,996. Hai cột gần phụ thuộc tuyến tính nghĩa là dữ liệu không phân biệt nổi "phần tăng do số hạng bậc nhất" với "phần tăng do số hạng bậc hai" — phép khớp phải chia một nguồn biến thiên gần như giống hệt cho hai hệ số. Hệ quả hiện ra trong ma trận $X^\top X$: hai cột gần song song làm các phần tử của $(X^\top X)^{-1}$ rất lớn, kéo $\mathrm{Var}(\hat\beta) = \sigma^2(X^\top X)^{-1}$ phình to — sai số chuẩn tăng, hai ước lượng kéo ngược nhau, và chỉ cần nhiễu đổi nhẹ là hai con số dao động mạnh dù bề mặt khớp hầu như không đổi. Sau tâm hoá, $u$ nhận các giá trị đối xứng quanh 0 (−20, 0, +20 trên trục $T$) còn $u^2$ nhận 400, 0, 400: $u$ là hàm lẻ, $u^2$ là hàm chẵn, tích $u \cdot u^2$ triệt tiêu trên mọi thiết kế đối xứng — tương quan đúng bằng 0, $X^\top X$ gần chéo, mỗi hệ số được ước lượng độc lập với sai số nhỏ (định lượng ở Phần H).

| Biến | Hai cột | Tương quan | Hệ quả |
|---|---|---|---|
| thô | $T$, $T^2$ | ≈ 0,996 | sai số chuẩn phình to, hai hệ số kéo ngược nhau |
| tâm hoá | $u$, $u^2$ | 0 | hai hệ số ước lượng độc lập, sai số nhỏ |

Còn một lợi ích thực hành: ba biến có ba đơn vị khác nhau (°C, %, phút), nhưng sau khi tâm hoá cả ba hệ số cùng đo "mỗi đơn vị lệch khỏi tâm góp bao nhiêu mg/g" — nhìn thẳng vào nhau thấy nhiệt độ (0,30) và nồng độ (0,26) dẫn dắt, thời gian (0,10) yếu hơn. Điểm giữa (60, 55, 75) cũng chính là tâm của thiết kế CCD ở Phần H — nơi đặt các lần lặp, nơi dữ liệu dày nhất.

**Đọc mô hình từng cụm.** Mô hình ước lượng được là
$$Y = 9{,}2 + 0{,}30u + 0{,}26v + 0{,}10w - 0{,}014u^2 - 0{,}009v^2 - 0{,}002w^2 + 0{,}005uv,$$
với $Y$ tính theo mg/g. Đọc theo từng nhóm số hạng:

- $9{,}2$ — tại tâm miền, dự đoán thu được 9,2 mg/g.
- $0{,}30u + 0{,}26v + 0{,}10w$ — gần tâm, mỗi °C tăng thêm góp ≈ 0,30 mg/g, mỗi % ethanol ≈ 0,26 mg/g, mỗi phút ≈ 0,10 mg/g.
- $-0{,}014u^2 - 0{,}009v^2 - 0{,}002w^2$ — các số hạng bậc hai âm: lợi ích của mỗi biến càng xa tâm càng teo dần, bề mặt cong xuống và có đỉnh; dấu âm chính là cơ chế "hiệu suất có cực đại trong miền".
- $+0{,}005uv$ — tương tác: hiệu quả của nhiệt độ lớn hơn khi ethanol đậm đặc hơn (và ngược lại); hai biến hỗ trợ nhau nhẹ. Không có số hạng $uw$, $vw$ nghĩa là thời gian gần như không tương tác với hai biến kia.

**Hai loại ràng buộc.** Bài toán có hai lớp ràng buộc khác bản chất. Lớp thứ nhất là **ràng buộc vận hành** — quy tắc do người vận hành đặt ra: $T \le 75$ (trên 75 °C flavonoid bắt đầu phân huỷ, thu được chất đã hỏng), $C \le 70$ (ngân sách dung môi của một mẻ), $t \le 90$ (một ca chiết không quá 90 phút). Lớp thứ hai là **biên vật lý** nói trên: $T \in [40, 80]$, $C \in [30, 80]$, $t \in [30, 120]$. Khác nhau ở chỗ ràng buộc vận hành là lựa chọn — có thể nới lỏng nếu trả thêm chi phí, và Phần D sẽ định lượng đúng "cái giá" đó bằng giá bóng — còn biên vật lý là dữ kiện không đổi: ngoài chúng, thí nghiệm không chạy được hoặc mô hình hết hiệu lực. Trong bài toán này $T \le 75$ chặt hơn $T \le 80$, nên biên trên của $T$ không bao giờ hoạt động; hai ràng buộc thực sự căng là $C \le 70$ và $t \le 90$.
```

Hai nhận xét về mô hình. Thứ nhất, nó có dạng lõm quanh đỉnh (các hệ số bình phương âm), đúng cấu trúc "hiệu suất có đỉnh trong miền". Thứ hai, nó là một ước lượng: các hệ số có sai số thực nghiệm, và điều này quyết định quy trình xác nhận ở Phần D.

```definition[Ma trận hoá mô hình bậc hai]
Gộp các hệ số thành vector $b = (\beta_1, \ldots, \beta_k)^\top$ và ma trận đối xứng $B$ với $B_{ii} = \beta_{ii}$, $B_{ij} = \beta_{ij}/2$ cho $i \neq j$, mô hình bậc hai viết gọn thành
$$Y(u) = \beta_0 + b^\top u + u^\top B u, \qquad u \in \mathbb{R}^k.$$
Vì $u^\top B u = \sum_i B_{ii} u_i^2 + 2\sum_{i<j} B_{ij} u_i u_j$, gradient và Hessian có dạng đóng
$$\nabla Y(u) = b + 2Bu, \qquad \nabla^2 Y(u) = 2B.$$
Đạo hàm riêng theo $u_i$ của $u^\top B u$ cho $2B_{ii}u_i + 2\sum_{j\neq i} B_{ij}u_j$ — đúng hàng thứ $i$ của $2Bu$. Điều kiện dừng $\nabla Y = 0$ là hệ tuyến tính $Bu = -b/2$: với $B$ xác định âm nó có nghiệm duy nhất, đó là điểm dừng, và vì $u^\top B u < 0$ cho $u \neq 0$ khi $B$ âm xác định, điểm dừng là cực đại toàn cục. Trong ví dụ flavonoid, $B$ có khối $(u, v)$ không chéo do hệ số tương tác — chi tiết ở Phần G.
```

```definition[Ước lượng bình phương tối thiểu]
Cho $n$ thí nghiệm với ma trận thiết kế $X$ ($n \times p$, mỗi hàng gồm các hàm cơ sở: hằng số, tuyến tính, bình phương, tương tác) và vector đáp ứng $y$. Mô hình $y = X\beta + \varepsilon$ với $\mathbb{E}[\varepsilon] = 0$, $\mathrm{Cov}(\varepsilon) = \sigma^2 I$. Ước lượng bình phương tối thiểu cực tiểu hoá tổng bình phương sai số
$$\hat\beta = \arg\min_\beta \|y - X\beta\|^2.$$
Nếu $X$ đủ hạng ($\mathrm{rank}\, X = p$), nghiệm duy nhất là $\hat\beta = (X^\top X)^{-1} X^\top y$, với $\mathrm{Var}(\hat\beta) = \sigma^2 (X^\top X)^{-1}$.
```

```proof[Phương trình chuẩn từ phép chiếu]
Khai triển $\|y - X\beta\|^2 = y^\top y - 2\beta^\top X^\top y + \beta^\top X^\top X \beta$. Gradient theo $\beta$: $-2X^\top y + 2X^\top X\beta$. Cho bằng 0 được **phương trình chuẩn** $X^\top X\beta = X^\top y$. Ma trận $X^\top X$ đối xứng nửa xác định dương, và xác định dương khi $X$ đủ hạng, nên nghiệm $\hat\beta = (X^\top X)^{-1}X^\top y$ là điểm dừng duy nhất; hàm mục tiêu toàn phương lồi nên đó là cực tiểu toàn cục. Không chệch: $\mathbb{E}[\hat\beta] = (X^\top X)^{-1}X^\top \mathbb{E}[y] = \beta$. Phương sai: $\mathrm{Var}(\hat\beta) = (X^\top X)^{-1}X^\top \cdot \sigma^2 I \cdot X(X^\top X)^{-1} = \sigma^2(X^\top X)^{-1}$. Các hệ số của mô hình flavonoid trong Phần A là kết quả của phép chiếu này lên dữ liệu của một thiết kế CCD — cấu trúc của $X^\top X$ và hệ quả lên sai số chuẩn ở Phần H.
```

Mô hình $Y = 9{,}2 + 0{,}30u + 0{,}26v + 0{,}10w - \ldots$ ở Phần A không phải hàm thật tìm được — nó là $\hat\beta = (X^\top X)^{-1}X^\top y$ khớp từ dữ liệu của một CCD. Ví dụ dưới đây tái dựng toàn bộ vòng đời từ 17 phép đo đến hàm ước lượng.

Trước hết, cơ chế. Nếu dữ liệu không nhiễu ($y = X\beta$ chính xác), phép khớp khôi phục đúng hàm:
$$\hat\beta = (X^\top X)^{-1}X^\top y = (X^\top X)^{-1}X^\top X \beta = \beta.$$
Mười bảy điểm của CCD (10 tham số, hạng đủ) chứa đủ thông tin để "giải ngược" ra 10 hệ số — đây là ý nghĩa của điều kiện $\mathrm{rank}\, X = p$ ở Phần A. Với nhiễu thật, $\hat\beta$ lệch khỏi $\beta$ một lượng cỡ sai số chuẩn; bảng dưới là một bộ dữ liệu mô phỏng (hàm thật cộng nhiễu $\sigma = 0{,}05$):

| (u; v; w) | Y (mg/g) | (u; v; w) | Y (mg/g) |
|---|---|---|---|
| (−1; −1; −1) | 8,456 | (1,68; 0; 0) | 9,625 |
| (−1; −1; 1) | 8,690 | (−1,68; 0; 0) | 8,599 |
| (−1; 1; −1) | 9,046 | (0; 1,68; 0) | 9,482 |
| (−1; 1; 1) | 9,193 | (0; −1,68; 0) | 8,735 |
| (1; −1; −1) | 9,049 | (0; 0; 1,68) | 9,309 |
| (1; −1; 1) | 9,224 | (0; 0; −1,68) | 9,017 |
| (1; 1; −1) | 9,667 | (0; 0; 0) | 9,267 |
| (1; 1; 1) | 9,823 | (0; 0; 0) | 9,175 |
| | | (0; 0; 0) | 9,186 |

Giải phương trình chuẩn cho bảng trên:

| Hệ số | $\hat\beta$ | $\beta$ thật | SE |
|---|---|---|---|
| 1 | 9,2081 | 9,200 | 0,0288 |
| u | 0,3004 | 0,300 | 0,0135 |
| v | 0,2612 | 0,260 | 0,0135 |
| w | 0,0881 | 0,100 | 0,0135 |
| u² | −0,0298 | −0,014 | 0,0149 |
| v² | −0,0312 | −0,009 | 0,0149 |
| w² | −0,0119 | −0,002 | 0,0149 |
| uv | 0,0153 | 0,005 | 0,0177 |
| uw | −0,0062 | 0,000 | 0,0177 |
| vw | −0,0133 | 0,000 | 0,0177 |

```example[Đọc kết quả của phép khớp]
Hàm ước lượng từ bộ dữ liệu trên:
$$Y = 9{,}208 + 0{,}3004u + 0{,}2612v + 0{,}0881w - 0{,}0298u^2 - 0{,}0312v^2 - 0{,}0119w^2 + 0{,}0153uv - 0{,}0062uw - 0{,}0133vw.$$
Ba nhận xét. Thứ nhất, mọi hệ số rơi trong 2 SE của giá trị thật (lớn nhất 1,5 SE) — phép khớp không chệch, và một bộ dữ liệu khác sẽ cho hàm hơi khác, đúng quy luật $\hat\beta \sim N(\beta, \sigma^2(X^\top X)^{-1})$. Thứ hai, các hệ số lệch nhất đều thuộc khối bậc hai: $u^2 = -0{,}0298$ gấp đôi giá trị thật, $v^2 = -0{,}0312$ gấp 3,5 lần — độ cong là phần kém xác định nhất của dữ liệu, đúng kết luận của Phần I. Thứ ba, hậu quả: tại điểm tối ưu, các toạ độ bậc hai cỡ 200 (u² ≈ 179, v² = w² = 225), nên một sai số 0,01 của hệ số cong khuếch đại thành sai số cỡ 2 mg/g ở giá trị đỉnh — cơ chế khiến khoảng tin cậy của Y* rộng (Phần I), và lý do quy trình xác nhận ở Phần D không thể bỏ qua.
```

## Phần H — Thiết kế thực nghiệm cho mô hình bậc hai

Mô hình bậc hai ba biến có $p = 1 + 3 + 3 + 3 = 10$ tham số — mười con số cần điền. Câu hỏi của phần này: chạy thí nghiệm ở những điểm nào để mười hệ số đó được ước lượng tốt nhất và để kiểm tra được mô hình. Câu trả lời kinh điển là thiết kế trung tâm tổ hợp (CCD), do Box và Wilson [^1] đề xuất cùng bề mặt đáp ứng.

### Kiến thức nền tảng — CCD là gì

**Ý tưởng.** Mỗi thí nghiệm là một phép đo $Y$ tại một điểm $(T, C, t)$. Mô hình có 10 hệ số nên phải chạy ít nhất 10 điểm — nhưng chạy ở đâu cũng quan trọng như chạy bao nhiêu lần, vì vị trí các điểm quyết định độ chính xác của từng hệ số. CCD là một công thức vị trí: ghép ba khối điểm quanh tâm miền, nên có tên "tổ hợp" (composite):

- **8 điểm giai thừa $(\pm 1)^3$** — tám góc của khối lập phương quanh tâm, mỗi biến lấy mức cao/thấp. Đây là thiết kế giai thừa $2^k$ kinh điển: các góc tách hiệu ứng chính và tương tác hiệu quả nhất (mỗi hệ số tuyến tính và tương tác được ước lượng với phương sai nhỏ nhất có thể với số điểm này).
- **Điểm tâm $(0, 0, 0)$, lặp $n_c$ lần** — chạy đi chạy lại cùng một điều kiện. Hai vai trò: (a) các lần lặp đo **sai số thuần** (pure error) — độ lệch giữa các lần chạy giống hệt nhau chính là thước đo nhiễu $\sigma$; (b) phát hiện **độ cong**: nếu trung bình tám góc cao hơn hoặc thấp hơn hẳn tâm, bề mặt có uốn — cần các số hạng bậc hai.
- **6 điểm sao $(\pm\alpha, 0, 0)$, $(0, \pm\alpha, 0)$, $(0, 0, \pm\alpha)$** — nằm trên ba trục, cách tâm khoảng $\alpha$. Vai trò của chúng là tách riêng ba độ cong $u^2$, $v^2$, $w^2$: trên tám góc cả ba đều bằng 1 nên không phân biệt được (ba cột trùng nhau, $X^\top X$ suy biến — không ước lượng riêng được); điểm sao làm mỗi hướng có một cột độ cong riêng.

**Vì sao $\alpha = 2^{k/4}$?** Đây là chỗ lý thuyết. Tiêu chí **tính quay (rotatability)**: phương sai dự đoán của $\hat Y(x)$ tại một điểm chỉ phụ thuộc khoảng cách từ điểm đó tới tâm, không phụ thuộc hướng — bề mặt dự đoán đáng tin như nhau theo mọi hướng. Trực giác: các điểm sao phải "bù" đúng cho khối giai thừa để các mô-men bậc bốn của thiết kế khớp với mô-men của phân phối đối xứng cầu; điều kiện chính xác là
$$\alpha = 2^{k/4}, \qquad \alpha^4 = 2^k,$$
với $k = 3$: $\alpha = 2^{3/4} = 1{,}682$. Việc $\alpha > 1$ có nghĩa các điểm sao nằm ngoài khối giai thừa — cần thiết để độ cong theo từng hướng được đo với độ chính xác tương đương các hiệu ứng tuyến tính.

**Đếm bậc tự do.** $n = 8 + 6 + 3 = 17$ thí nghiệm cho 10 tham số, còn 7 bậc tự do cho sai số — vừa đủ để kiểm định lack-of-fit (Phần D) và để sai số chuẩn có ý nghĩa. Tâm $(0, 0, 0)$ chính là điểm $(60, 55, 75)$ của bài toán: toàn bộ thiết kế đối xứng quanh đúng tâm miền đã dùng để tâm hoá ở Phần A. Hai khái niệm gắn với nhau — mô hình bậc hai được ước lượng và đọc quanh điểm có nhiều dữ liệu nhất.

Cấu trúc và tính chất đầy đủ của CCD trình bày ở Montgomery [^6] và Box–Draper [^7].

```definition[Thiết kế trung tâm tổ hợp (CCD)]
**Thiết kế trung tâm tổ hợp** gồm ba khối: $2^3 = 8$ điểm giai thừa $(\pm 1)^3$, $2k = 6$ điểm sao $(\pm\alpha, 0, 0)$, $(0, \pm\alpha, 0)$, $(0, 0, \pm\alpha)$, và $n_c$ điểm lặp tại tâm. Khoảng cách sao $\alpha$ chọn theo tính quay (rotatability): phương sai dự đoán của $\hat Y(x)$ chỉ phụ thuộc $\|x\|$, không phụ thuộc hướng, khi
$$\alpha = 2^{k/4}, \qquad \text{ở đây } \alpha = 2^{3/4} = 1{,}682, \qquad \alpha^4 = 2^k = 8.$$
Với $k = 3$ và $n_c = 3$: tổng cộng 17 thí nghiệm cho 10 tham số — 7 bậc tự do dành cho sai số (Hình 1).
```

<figure style="margin:1.8em 0;"><img src="/img/opt/ccd-design.svg" alt="Thiết kế trung tâm tổ hợp ba biến" style="display:block;width:100%;max-width:640px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — CCD cho ba biến: 8 điểm giai thừa (teal) tại đỉnh khối lập phương (±1)³, 6 điểm sao (vàng) tại ±α = ±1,682 trên các trục, và tâm lặp 3 lần (xanh). Tính quay: α⁴ = 2³ = 8.</figcaption></figure>

```remark[Trực giao và phương sai của hệ số]
Với $\alpha = 2^{k/4}$, ma trận $X^\top X$ của CCD có cấu trúc khối chéo: khối tuyến tính $\{u, v, w\}$, khối tương tác $\{uv, uw, vw\}$, khối $\{1, u^2, v^2, w^2\}$. Mọi tích chéo giữa hai khối khác nhau bằng 0: $\sum u_i = 0$, $\sum u_i v_i = 0$, $\sum u_i^2 v_i = 0$, $\sum u_i v_i w_i = 0$ — nên hệ số thuộc các khối khác nhau ước lượng độc lập. Khối tuyến tính chéo, với $\sum u_i^2 = 8 + 2\alpha^2 = 13{,}66$ (8 điểm giai thừa cộng 2 điểm sao trên trục $u$):
$$\mathrm{Var}(\hat\beta_u) = \frac{\sigma^2}{\sum u_i^2}, \qquad \mathrm{SE}(\hat\beta_u) = \frac{\sigma}{\sqrt{13{,}66}} = 0{,}0135 \ \text{với } \sigma = 0{,}05.$$
Sai số chuẩn dưới 5% giá trị hệ số $0{,}30$: dữ liệu đủ để phân biệt các hệ số. Vai trò của khối sao: nếu chỉ có 8 điểm giai thừa và tâm, thì $u^2 = v^2 = w^2$ trên mọi điểm của thiết kế — ba cột trùng nhau, $X^\top X$ suy biến, và $\beta_{uu}, \beta_{vv}, \beta_{ww}$ không ước lượng riêng được. Điểm sao tách các hướng: tại $(\pm\alpha, 0, 0)$ chỉ $u^2 \neq 0$, tại $(0, \pm\alpha, 0)$ chỉ $v^2 \neq 0$. Độ cong theo từng hướng chỉ đo được nhờ khối này — lý do CCD cần điểm sao dù chúng nằm ngoài khối giai thừa.
```

## Phần G — Hình học bậc hai: phân tích chính tắc

Ma trận $B$ trong dạng toàn phương mang toàn bộ thông tin về hình dạng bề mặt. Vì $B$ đối xứng, nó chéo hoá trực giao được: $B = Q\Lambda Q^\top$ với $Q$ trực giao và $\Lambda = \mathrm{diag}(\lambda_1, \ldots, \lambda_k)$. Đây là khung của phân tích chính tắc trong lý thuyết bề mặt đáp ứng [^7].

```definition[Phân tích chính tắc]
Gọi $u^*$ là điểm dừng ($Bu^* = -b/2$) và $w = Q^\top (u - u^*)$ là toạ độ theo các trục chính. Mô hình bậc hai trở thành dạng chính tắc
$$Y = Y(u^*) + \sum_{i=1}^k \lambda_i w_i^2,$$
vì $u^\top B u - u^{*\top} B u^* = (u - u^*)^\top B (u - u^*) = w^\top \Lambda w$. Phân loại điểm dừng theo dấu các $\lambda_i$: toàn âm — cực đại; toàn dương — cực tiểu; trái dấu — yên ngựa; có $\lambda_i = 0$ — hệ thống rãnh (ridge) dọc trục thứ $i$. Đây là tiêu chuẩn phân loại đầy đủ của bề mặt bậc hai, không cần vẽ.
```

```example[Trị riêng của ma trận B trong bài toán]
Với mô hình flavonoid, $B$ có khối $(u, v)$ không chéo do hệ số tương tác:
$$B = \begin{pmatrix} -0{,}014 & 0{,}0025 & 0 \\ 0{,}0025 & -0{,}009 & 0 \\ 0 & 0 & -0{,}002 \end{pmatrix}.$$
Trị riêng của khối $(u,v)$ là nghiệm của $\lambda^2 + 0{,}023\lambda + 0{,}00011975 = 0$ (tổng $-0{,}023$, tích $0{,}00011975$):
$$\lambda_1 = -0{,}00796, \qquad \lambda_2 = -0{,}01504,$$
cùng $\lambda_3 = -0{,}002$. Cả ba âm — điểm dừng là cực đại; tích $4\lambda_1\lambda_2 = 4{,}79 \times 10^{-4}$ chính là định thức của Hessian trên mặt phẳng $(u,v)$ sẽ dùng ở Phần B. Vector riêng ứng với $\lambda_1$ là $(0{,}38; 0{,}92)$: trục dài của các elíp mức, hợp với trục $u$ một góc $67{,}5°$; vector ứng với $\lambda_2$ là $(0{,}92; -0{,}38)$, vuông góc với nó, góc $-22{,}5°$ (Hình 2). Hệ số tương tác $uv$ không đổi dấu các $\lambda_i$ nhưng làm xoay các trục chính khỏi trục toạ độ: nếu $\beta_{uv} = 0$, khối $(u,v)$ đã chéo sẵn và các trục chính trùng trục toạ độ.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/canonical.svg" alt="Phân tích chính tắc của bề mặt đáp ứng" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Đường mức của Y(u, v) tại w = 25. Các elíp đồng tâm tại cực đại tự do (14,0; 18,3), trục dài nghiêng 67,5° (hướng (0,38; 0,92), λ = −0,0080), trục ngắn vuông góc (λ = −0,0150). Đường đỏ là biên C = 70; tối ưu ràng buộc (13,4; 15,0) nằm trên đó.</figcaption></figure>

```remark[Đọc kết quả từ phân tích chính tắc]
Trục dài (ứng với $\lambda_1$ gần 0 nhất) là hướng bề mặt "phẳng nhất": đi xa đỉnh theo hướng này làm hiệu suất giảm chậm nhất. Với quyết định thực tế: quanh nghiệm tối ưu, thay đổi theo hướng $(0{,}38; 0{,}92)$ trong mặt phẳng $(T, C)$ ít rủi ro hơn thay đổi vuông góc với nó; nếu giai đoạn xác nhận lệch khỏi dự đoán, biết hướng nhạy cảm giúp chọn điểm kiểm tra. Khi có $\lambda_i$ gần 0, bề mặt gần suy biến: nhiều tổ hợp cho hiệu suất gần như nhau và "nghiệm" kém xác định — phải cảnh giác với khẳng định nghiệm duy nhất. Trong bài toán này mọi $\lambda_i$ cách 0 đủ xa, nên đỉnh được xác định tốt.
```

## Phần B — Giải bằng điều kiện KKT

```theorem[Điều kiện KKT cho bài toán chiết xuất]
Xét bài toán cực đại $Y$ với $Y$ lõm và các ràng buộc $g_i \le 0$ lồi. Điểm $x^*$ là nghiệm tối ưu khi và chỉ khi tồn tại $\lambda_i \ge 0$ sao cho
$$\nabla Y(x^*) = \sum_i \lambda_i \nabla g_i(x^*), \qquad \lambda_i g_i(x^*) = 0 \ \forall i, \qquad g_i(x^*) \le 0 \ \forall i.$$
Điều kiện $\lambda_i g_i(x^*) = 0$ là **độ bù**: hoặc ràng buộc $i$ hoạt động ($g_i = 0$), hoặc nhân tử của nó bằng 0. Nhân tử $\lambda_i$ chính là **giá bóng** của ràng buộc $i$: hiệu suất tăng thêm khi nới ràng buộc đó một đơn vị.

*Dẫn giải.* Đây là dạng bài toán cực đại của điều kiện KKT chuẩn: tại nghiệm, gradient của mục tiêu nằm trong nón sinh bởi gradient của các ràng buộc hoạt động. Với bài toán lõm–lồi, điều kiện này vừa cần vừa đủ, và nghiệm là cực đại toàn cục.
```

Chứng minh đầy đủ và các trường hợp tổng quát ở Boyd và Vandenberghe [^3]; lịch sử của điều kiện gắn với Karush (1939) và Kuhn–Tucker (1951) [^4].

```remark[Điều kiện chính quy và chiều ngược lại]
Khẳng định "khi và chỉ khi" ở định lý trên cần hai giả định. Chiều thuận (nghiệm thì tồn tại $\lambda$): cần một điều kiện chính quy — với ràng buộc bất đẳng thức, điều kiện chuẩn là gradient của các ràng buộc hoạt động độc lập tuyến tính (LICQ), hoặc điều kiện Slater trong trường hợp lồi: tồn tại điểm thoả mọi ràng buộc bất đẳng thức một cách chặt. Thiếu điều kiện chính quy, có thể có điểm tối ưu không thoả KKT — ví dụ cổ điển khi ba ràng buộc cắt nhau ngay tại nghiệm. Chiều ngược lại (tồn tại $\lambda$ thì tối ưu): nói chung chỉ đúng khi bài toán lồi — chính là trường hợp của bài toán này, $Y$ lõm và các $g_i$ lồi. Bài toán chiết xuất thoả Slater một cách hiển nhiên (điểm trung tâm $(0, 0, 0)$ nằm sâu trong mọi ràng buộc), nên KKT là điều kiện cần và đủ.
```

```proof[Tính đủ của KKT cho bài toán lõm]
Giả sử $Y$ lõm, $g_i$ lồi, và tồn tại $\lambda_i \ge 0$ thoả ba điều kiện KKT tại $x^*$. Lấy $x$ khả thi bất kỳ. Do $g_i$ lồi, $g_i(x) \ge g_i(x^*) + \nabla g_i(x^*)^\top (x - x^*)$, nên $\nabla g_i(x^*)^\top (x - x^*) \le g_i(x) - g_i(x^*)$. Với ràng buộc hoạt động ($g_i(x^*) = 0$), vế phải là $g_i(x) \le 0$, do đó $\lambda_i \nabla g_i(x^*)^\top (x - x^*) \le 0$ cho mọi $i$ (các $\lambda_i = 0$ không đóng góp). Cộng theo $i$ và dùng điều kiện dừng $\nabla Y(x^*) = \sum_i \lambda_i \nabla g_i(x^*)$:
$$\nabla Y(x^*)^\top (x - x^*) \le 0.$$
Do $Y$ lõm, $Y(x) \le Y(x^*) + \nabla Y(x^*)^\top (x - x^*) \le Y(x^*)$. Vậy $x^*$ là cực đại toàn cục. $\blacksquare$
```

```example[Giải số]
Điều kiện dừng không ràng buộc: $\partial Y/\partial u = 0{,}30 - 0{,}028u + 0{,}005v = 0$; $\partial Y/\partial v = 0{,}26 - 0{,}018v + 0{,}005u = 0$; $\partial Y/\partial w = 0{,}10 - 0{,}004w = 0$. Nghiệm: $u = 13{,}99$ ($T = 74{,}0$), $v = 18{,}33$ ($C = 73{,}3$), $w = 25$ ($t = 100$). Điểm này vi phạm $C \le 70$ và $t \le 90$: cực đại không ràng buộc không khả thi.

Kẹp hai ràng buộc hoạt động: $v = 15$ ($C = 70$) và $w = 15$ ($t = 90$). Phương trình còn lại theo $u$: $0{,}30 - 0{,}028u + 0{,}005 \cdot 15 = 0$, cho $u = 13{,}39$ ($T = 73{,}4$). Kiểm tra: $T = 73{,}4 \le 75$ — thoả. Nghiệm tối ưu: $(73{,}4°C;\ 70\%;\ 90\ \text{phút})$, hiệu suất $Y^* = 14{,}64$ mg/g (Hình 3).

Nhân tử KKT: $\lambda_C = \partial Y/\partial v = 0{,}26 - 0{,}018 \cdot 15 + 0{,}005 \cdot 13{,}39 \approx 0{,}057$; $\lambda_t = \partial Y/\partial w = 0{,}10 - 0{,}004 \cdot 15 = 0{,}040$; $\partial Y/\partial u = 0$ tại nghiệm — nhiệt độ không phải ràng buộc hoạt động. Hessian của $Y$ theo $(u,v,w)$ âm xác định (định thức $4{,}79 \times 10^{-4} > 0$ trên mặt phẳng $(u,v)$ — đã tính ở Phần G —, phần tử chéo âm), nên điểm dừng là cực đại toàn cục.
```

```remark[Điều kiện bậc hai cho bài toán có ràng buộc]
Với ràng buộc hoạt động $v = 15$, $w = 15$, điều kiện bậc hai đúng phải xét trên không gian tiếp tuyến của các ràng buộc, không phải trên toàn $\mathbb{R}^3$. Khử $v, w$ bằng phép thế: bài toán rút gọn còn một biến $u$, và đạo hàm bậc hai của hàm rút gọn là $d^2Y/du^2 = -0{,}028 < 0$ — âm trên không gian tiếp tuyến. Tiêu chuẩn tổng quát dùng **ma trận biên (bordered Hessian)**: với $m$ ràng buộc hoạt động $h_j(u) = 0$, xét
$$\begin{pmatrix} 0 & \nabla h^\top \\ \nabla h & \nabla^2 L \end{pmatrix}, \qquad L = Y + \sum_j \lambda_j h_j,$$
và yêu cầu các định thức con chính dẫn đầu từ bậc $2m+1$ đến $m+k$ đan dấu theo quy tắc tương ứng với cực đại trên không gian tiếp tuyến. Hai cách kiểm tra tương đương; phép thế đơn giản hơn khi ít ràng buộc, ma trận biên cần thiết khi ràng buộc phi tuyến. Trong bài toán này, phép thế xác nhận điều đã biết: điểm $(13{,}39; 15; 15)$ là cực đại của hàm rút gọn, nên là cực đại địa phương của bài toán gốc, và do tính lõm — cực đại toàn cục.
```

```theorem[Định lý vỏ bọc]
Xét bài toán có tham số $b$: $Y^*(b) = \max_x \{Y(x) : g_j(x) \le b_j\}$, với nghiệm $x^*(b)$ trơn theo $b$. Nếu ràng buộc $j$ hoạt động tại nghiệm thì
$$\frac{\partial Y^*}{\partial b_j} = \lambda_j(b),$$
trong đó $\lambda_j$ là nhân tử KKT của ràng buộc $j$: **giá bóng đúng là đạo hàm của hàm giá trị**.

*Chứng minh.* $Y^*(b) = Y(x^*(b))$, nên $\partial Y^*/\partial b_j = \nabla Y(x^*) \cdot \partial x^*/\partial b_j$. Từ điều kiện dừng, $\nabla Y(x^*) = \sum_i \lambda_i \nabla g_i(x^*)$, suy ra $\partial Y^*/\partial b_j = \sum_i \lambda_i \nabla g_i(x^*) \cdot \partial x^*/\partial b_j$. Với ràng buộc hoạt động, $g_i(x^*(b)) = b_i$ với mọi $b$ trong lân cận; đạo hàm toàn phần hai vế theo $b_j$: $\nabla g_i(x^*) \cdot \partial x^*/\partial b_j = \delta_{ij}$. Chỉ số hạng $i = j$ còn lại: $\partial Y^*/\partial b_j = \lambda_j$. $\blacksquare$
```

<figure style="margin:1.8em 0;"><img src="/img/opt/extraction.svg" alt="Bề mặt đáp ứng chiết xuất dược liệu" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Bề mặt đáp ứng Y(T, C) tại t = 90 phút. Miền khả thi (tô xanh) bị chặn bởi C = 70 và T = 75; tối ưu (73,4 ; 70) nằm trên biên C = 70. Cực đại không ràng buộc (74,0 ; 73,3) nằm ngoài miền.</figcaption></figure>

## Phần C — Kiểm chứng và độ nhạy

Nghiệm KKT nên được kiểm chứng bằng cách so sánh với các điểm lân cận (bảng dưới, tại $t = 90$ trừ hàng cuối):

| Điều kiện (T; C; t) | Y (mg/g) | Ghi chú |
|---|---|---|
| (60; 55; 90) | 10,25 | điểm trung tâm của thiết kế |
| **(73,4; 70; 90)** | **14,64** | nghiệm tối ưu |
| (75; 70; 90) | 14,60 | chạm biên nhiệt độ — kém hơn |
| (70; 70; 90) | 14,48 | dưới nhiệt độ tối ưu |
| (73,4; 70; 100) | 14,84 | vi phạm ngân sách thời gian |

Ba kết luận từ bảng. Nghiệm $(73{,}4; 70; 90)$ cho hiệu suất cao nhất trong số các điểm khả thi. Chạm biên nhiệt độ $T = 75$ không giúp ích ($14{,}60 < 14{,}64$) — ràng buộc nhiệt độ không hoạt động, giữ 73–74 °C là đủ. Kéo dài thời gian tới 100 phút tăng hiệu suất lên 14,84 nhưng vi phạm ngân sách ca chiết.

<figure style="margin:1.8em 0;"><img src="/img/opt/extraction-check.svg" alt="Kiểm chứng nghiệm và giá bóng" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — (a) Hiệu suất tại các điểm ứng viên: tối ưu (teal) cao nhất trong miền khả thi; điểm (73,4 ; 70 ; 100) cao hơn nhưng vi phạm thời gian (đỏ). (b) Giá bóng: nới ethanol thêm 1 điểm % tăng hiệu suất 0,057; thêm 1 phút tăng 0,040; nhiệt độ có giá bóng 0.</figcaption></figure>

```remark[Giá bóng và quyết định]
Hai ràng buộc hoạt động có giá bóng dương; ràng buộc nhiệt độ có giá bóng 0 (Hình 4b). Cách đọc: mua thêm 10 phút cho một ca chiết tăng hiệu suất $14{,}84 - 14{,}64 = 0{,}20$ mg/g — quyết định này là so sánh chi phí vận hành của 10 phút với 0,20 mg/g. Nâng giới hạn ethanol từ 70 lên 71% tăng hiệu suất xấp xỉ 0,057 mg/g — cơ sở định lượng để đàm phán giá dung môi. Lưu ý độ tăng biên giảm dần: bề mặt lõm nên giá bóng chỉ đúng trong lân cận nghiệm; muốn biết giá trị của một thay đổi lớn phải giải lại bài toán.
```

```example[Kiểm chứng số của định lý vỏ bọc]
Giải lại bài toán với giới hạn $C \le b$ cho $b = 70, 71, 72, 73, 73{,}33$ (tức $v \le 15, 16, 17, 18, 18{,}33$), mỗi lần tối ưu lại theo $u$; kết quả ở bảng dưới.
```

| Giới hạn b = C (%) | u* | Y* (mg/g) | dY*/db = λ(b) |
|---|---|---|---|
| 70 | 13,39 | 14,636 | 0,057 |
| 71 | 13,57 | 14,685 | 0,040 |
| 72 | 13,75 | 14,716 | 0,023 |
| 73 | 13,93 | 14,730 | 0,006 |
| 73,33 | 13,99 | 14,731 | 0,000 |

```remark[Ba nhận xét từ bảng]
Thứ nhất, độ tăng thật $Y^*(71) - Y^*(70) = 0{,}048$ nằm giữa $\lambda(70) = 0{,}057$ và $\lambda(71) = 0{,}040$: $\lambda$ là đạo hàm tức thời, còn độ tăng qua một khoảng là tích phân của nó. Thứ hai, $\lambda(b)$ giảm tuyến tính và triệt tiêu tại $b = 73{,}33$ — đúng cực đại không ràng buộc, nơi ràng buộc ethanol ngừng hoạt động; nghiệm của hệ tuyến tính ở Phần B chính là điểm cắt này. Thứ ba, tổng lợi ích khi nới từ 70 lên 73,33 là $14{,}731 - 14{,}636 = 0{,}095$, đúng bằng diện tích tam giác dưới đường $\lambda(b)$: $\tfrac{1}{2} \cdot 0{,}057 \cdot 3{,}33 \approx 0{,}095$. Giá trị của một thay đổi lớn là tích phân của giá bóng — dạng tích phân của định lý vỏ bọc, và lý do chính xác để "giải lại bài toán" thay vì nhân $\lambda$ với độ lớn thay đổi.
```

```remark[Vì sao Hessian âm là điều kiện đủ]
Với hàm lõm, điểm dừng là cực đại toàn cục: không cần dò nhiều điểm khởi đầu. Hessian âm xác định ở Phần B khẳng định $Y$ lõm quanh nghiệm. Nếu mô hình có số hạng tương tác lớn hoặc hệ số bình phương dương, bề mặt có thể có yên ngựa hoặc hai đỉnh — khi đó phải vẽ bề mặt và dùng nhiều điểm khởi đầu, không tin vào một điểm dừng.
```

## Phần I — Độ nhạy Monte Carlo và khoảng tin cậy của nghiệm

Mọi con số ở các phần trước — hệ số, nghiệm $(73{,}4; 70; 90)$, $Y^* = 14{,}64$ — là hàm của vector ước lượng $\hat\beta$, và $\hat\beta$ là một vector ngẫu nhiên với hiệp phương sai $\sigma^2(X^\top X)^{-1}$ (Phần A và H). Câu hỏi của phần này: sai số ước lượng hệ số lan truyền thế nào vào nghiệm tối ưu? Trả lời bằng hai cách — bậc nhất qua định lý vỏ bọc, và đầy đủ qua Monte Carlo.

Với $\sigma = 0{,}05$ và CCD 17 thí nghiệm, sai số chuẩn của mọi hệ số suy từ đường chéo của $(X^\top X)^{-1}$:

| Hệ số | Ước lượng | SE | t |
|---|---|---|---|
| $\beta_0$ | 9,20 | 0,029 | 319 |
| $b_u$ | 0,30 | 0,0135 | 22,2 |
| $b_v$ | 0,26 | 0,0135 | 19,2 |
| $b_w$ | 0,10 | 0,0135 | 7,4 |
| $B_{uu}$ | −0,014 | 0,0149 | −0,94 |
| $B_{vv}$ | −0,009 | 0,0149 | −0,60 |
| $B_{ww}$ | −0,002 | 0,0149 | −0,13 |
| $B_{uv}$ | 0,005 | 0,0177 | 0,28 |

```remark[Đọc bảng: dốc tốt, cong kém]
Với $df = 17 - 10 = 7$, ngưỡng t hai phía mức 5% là 2,37. Ba hệ số tuyến tính ($t = 22{,}2$; $19{,}2$; $7{,}4$) vượt xa ngưỡng; không hệ số cong nào ($|t| \le 0{,}94$) có ý nghĩa. Hệ quả: hướng leo dốc được xác định chặt, nhưng độ cong — thứ quyết định vị trí và độ cao của đỉnh — thì không. Đây là phiên bản định lượng của cạm bẫy ngoại suy ở Phần D dưới đây: đỉnh nằm cách tâm thiết kế khoảng 25,1 đơn vị mã hoá, và giá trị tại đó được dự đoán bởi chính các hệ số kém tin cậy nhất.
```

```remark[Phương sai bậc nhất của giá trị tối ưu]
Với tập ràng buộc hoạt động cố định, định lý vỏ bọc cho $\partial Y^*/\partial\beta_i = x^*_i$ — đạo hàm của $Y$ theo hệ số $\beta_i$ tại nghiệm, vì $x^*$ là điểm tối ưu nên các số hạng chứa chuyển động của $x^*$ triệt tiêu. Do đó, bậc nhất:
$$\mathrm{Var}(Y^*) = \sum_{i,j} \mathrm{Cov}(\beta_i, \beta_j)\, x^*_i x^*_j = \sigma^2 x^{*\top}(X^\top X)^{-1} x^*.$$
Với $x^* = (1; 13{,}39; 15; 15; 179{,}3; 225; 225; 200{,}9; 200{,}9; 225)$ (các monomial của nghiệm trong từng cột của $X$), tính được $\mathrm{Var}(Y^*) = 87{,}8$, tức $\mathrm{SD}(Y^*) = 9{,}4$ mg/g. Khối hệ số bậc hai đóng góp $87{,}8/87{,}95 \approx 99{,}9\%$ phương sai: độ bất định của giá trị đỉnh gần như hoàn toàn do độ cong, không phải do độ dốc. Số 9,4 là thang đo bậc nhất; Monte Carlo dưới đây xác nhận bậc này.
```

```example[Monte Carlo: 20 000 lần rút hệ số]
Rút 20 000 vector $\beta$ từ $N(\hat\beta, \sigma^2(X^\top X)^{-1})$ và giải lại bài toán ràng buộc cho từng vector. Kết quả ba tầng. Thứ nhất, chỉ $19\%$ số lần rút giữ được ma trận $B$ âm xác định — bề mặt còn lõm; với 81% còn lại mô hình không còn dùng được để tối ưu (đỉnh trượt ra ngoài miền thiết kế hoặc biến thành yên ngựa). Tần suất 19% là thước đo định lượng của lời cảnh báo ở Phần F dưới đây: dữ liệu hiện tại không đủ để khẳng định tồn tại đỉnh trong miền. Thứ hai, với 3771 lần rút lõm, hiệu suất đỉnh $Y^*$ có trung bình 11,1, SD 7,8, khoảng 95% [5,5; 16,6] (Hình 5a) — khoảng rộng hơn chính giá trị ước lượng. Thứ ba, vị trí ổn định hơn giá trị: trong số các lần rút có cùng cấu trúc ràng buộc ($v = 15$, $w = 15$), nhiệt độ tối ưu $T^*$ có SD 5,5 °C và khoảng 95% [58; 75] (Hình 5b). Mô hình định vị đỉnh trong vài độ C; độ cao đỉnh thì không định lượng được.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/mc-sensitivity.svg" alt="Monte Carlo độ nhạy của nghiệm tối ưu" style="display:block;width:100%;max-width:840px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 5 — (a) Y* từ 3771 lần rút giữ được bề mặt lõm; đường đứt vàng là chuẩn cùng trung bình 11,1 và SD 7,8 — phân phối lệch, đuôi nặng; đường đỏ là ước lượng điểm 14,64. (b) T* từ 865 lần rút cùng cấu trúc ràng buộc v = 15, w = 15; SD 5,5 °C, ước lượng điểm 73,4.</figcaption></figure>

```remark[Vì sao trung bình có điều kiện thấp hơn ước lượng điểm]
Trung bình có điều kiện của $Y^*$ (11,1) thấp hơn ước lượng điểm (14,64) — không phải sai lệch. Điều kiện "B âm xác định" chọn các lần rút có độ cong âm mạnh hơn, và tại nghiệm $v^2 = w^2 = 225$ nên độ cong âm mạnh hơn hạ thấp đỉnh dự đoán. Đây là hiệu ứng chọn mẫu của chính điều kiện hoá: khoảng [5,5; 16,6] là khoảng có điều kiện, không phải khoảng tin cậy vô điều kiện của $Y^*$.
```

```remark[Bài học thực hành: mô hình định vị, thực nghiệm định lượng]
Ba kết luận cho quyết định. Thứ nhất, khoảng [5,5; 16,6] của $Y^*$ giải thích vì sao quy trình hai giai đoạn ở Phần D dưới đây không phải tuỳ chọn: giai đoạn hai đo trực tiếp $Y$ tại $(73{,}4; 70; 90)$, và phép đo này không phụ thuộc vào độ cong ước lượng kém — đó là cách duy nhất để chứng nhận độ cao đỉnh. Thứ hai, hướng cải thiện thiết kế: tăng số điểm tâm $n_c$ (thêm bậc tự do, ước lượng $\sigma$ tốt hơn), tăng $\alpha$ (đòn bẩy của độ cong), hoặc giảm $\sigma$ (phép đo chính xác hơn); sai số chuẩn của hệ số cong tỉ lệ với $\sigma/\sqrt{\Sigma u^4 - (\Sigma u^2)^2/n}$, với thiết kế này $\Sigma u^4 = 24$, $\Sigma u^2 = 13{,}66$, $n = 17$ cho mẫu số $\sqrt{13{,}0}$. Thứ ba, phương pháp: lan truyền sai số bậc nhất ở loạt bài *Thống kê cơ bản cho khoa học sự sống* (Phần 4), khoảng tin cậy (Phần 1), còn Monte Carlo là phân tích độ nhạy toàn cục, với khung phương pháp đầy đủ ở Saltelli et al.
```

Khung phân tích độ nhạy toàn cục và các chỉ số dựa trên phương sai — Sobol, tổng ảnh hưởng — trình bày ở Saltelli et al. [^8].

## Phần D — Quy trình thực hành

```remark[Quy trình hai giai đoạn]
Nghiệm $(73{,}4; 70; 90)$ là tối ưu của một mô hình ước lượng, không phải của thực tế. Quy trình chuẩn gồm hai giai đoạn. Giai đoạn một: tối ưu trên mô hình như Phần B. Giai đoạn hai: chạy thực nghiệm tại điểm tối ưu và quanh nó (chẳng hạn lưới $73{,}4 \pm 2$ °C, $70 \pm 2$ %, $90 \pm 10$ phút) để xác nhận hiệu suất dự đoán; nếu thực nghiệm lệch khỏi dự đoán đáng kể, bổ sung điểm vào thiết kế, ước lượng lại mô hình và giải lại. Cấu trúc hai giai đoạn này là quy tắc chung của tối ưu hoá trên mô hình ước lượng.
```

Năm lỗi thường gặp khi dùng mô hình bề mặt đáp ứng để ra quyết định. Mỗi lỗi được phân tích theo cùng một cấu trúc — cơ chế, con số định lượng từ bài toán này, và cách xử lý.

```remark[Cạm bẫy 1 — ngoại suy]
Mô hình bậc hai được khớp trên miền thiết kế $[-\alpha, \alpha]^3 \approx [-1{,}68; 1{,}68]^3$ (toạ độ mã hoá) — một khối lập phương nhỏ quanh tâm. Nghiệm $(13{,}4; 15; 15)$ cách tâm $\|x^*\| = \sqrt{13{,}4^2 + 15^2 + 15^2} = 25{,}1$ đơn vị — khoảng 15 lần bán kính thiết kế. Dùng mô hình tại đó là ngoại suy, không phải nội suy, và giá phải trả có hai thành phần, cả hai đều đo được.

**Phương sai.** Từ $\hat Y(x) = x^\top \hat\beta$ và $\mathrm{Var}(\hat\beta) = \sigma^2 (X^\top X)^{-1}$:
$$\mathrm{Var}(\hat Y(x)) = x^\top \mathrm{Var}(\hat\beta)\, x = \sigma^2 x^\top (X^\top X)^{-1} x.$$
Tại tâm, $x = (1, 0, \ldots, 0)$: $\mathrm{Var} = \sigma^2 (X^\top X)^{-1}_{11} = 0{,}00083$, SD 0,029 mg/g. Tại nghiệm, vector thiết kế chứa $u^2 = 179{,}6$, $v^2 = w^2 = 225$ và các tích chéo: $\mathrm{Var} = 87{,}6$, SD 9,36 — gấp 325 lần. Phân rã theo khối: 99,9% phương sai tại nghiệm đến từ khối bậc hai (46,8 từ các cột $u^2, v^2, w^2$ cộng 40,7 từ hiệp phương sai của chúng với hằng số). Phương sai bùng nổ vì $x^*$ nằm xa tâm, nơi các hàm $u^2, v^2, w^2$ phóng đại mọi bất định của hệ số cong.

Khoảng tin cậy 95% của trung bình dự đoán tại nghiệm: $14{,}64 \pm t_{7;\,0{,}975} \cdot 9{,}36 = 14{,}64 \pm 2{,}365 \cdot 9{,}36 = 14{,}64 \pm 22{,}1$, tức $[-7{,}5;\, 36{,}8]$. Khoảng dự đoán cho một quan sát mới chênh không đáng kể: thừa số $\sqrt{1 + x^\top(X^\top X)^{-1}x}$ so với $\sqrt{x^\top(X^\top X)^{-1}x}$ khác 0,001% vì số hạng thiết kế (35 060) trội hẳn số 1. Khoảng rộng gấp ba lần chính giá trị ước lượng — "nghiệm cho $Y^* = 14{,}6$" không kèm khoảng là một con số không mang nghĩa.

**Thiên lệch.** Ngoài phương sai, phần dư Taylor bậc ba (Phần F dưới đây) tăng như $\|x\|^3$ khi ra xa tâm; thiên lệch này không giảm khi tăng cỡ mẫu. Hai thành phần cộng lại: càng xa tâm, sai số dự đoán càng do thiên lệch chi phối.

**Dấu hiệu và xử lý.** Ba dấu hiệu cảnh báo: nghiệm nằm trên biên của miền khả thi (ở đây $C = 70$ — quyết định nhạy với chính ràng buộc, Phần C); $\|x^*\|$ vượt xa bán kính thiết kế; và $Y^* = 14{,}6$ vượt mọi giá trị quan sát (lớn nhất 9,84). Xử lý: dịch tâm và thu nhỏ thang thiết kế quanh vùng hứa hẹn rồi chạy giai đoạn hai (Phần D); phân tích ridge để kẹp nghiệm trong bán kính đáng tin; hoặc nếu phải ra xa — chấp nhận và báo cáo độ rộng của khoảng.
```

```remark[Cạm bẫy 2 — tương quan biến]
Hệ số $\hat\beta_j$ ước lượng độc lập chỉ khi các cột của $X$ trực giao. Khi không trực giao, phương sai của $\hat\beta_j$ tăng theo mức cột $j$ được giải thích bởi các cột khác. Đo bằng hệ số phóng đại phương sai (VIF): hồi quy cột $j$ lên các cột còn lại (kể cả hằng số), lấy $R^2_j$, đặt
$$\mathrm{VIF}_j = \frac{1}{1 - R^2_j}, \qquad \mathrm{Var}(\hat\beta_j) = \frac{\sigma^2 \cdot \mathrm{VIF}_j}{SXX_j}, \qquad SXX_j = \sum_i (x_{ij} - \bar x_j)^2.$$
VIF = 1: trực giao hoàn toàn; VIF càng lớn, hệ số càng bất ổn.

CCD tránh được điều này nhờ cấu trúc khối chéo (Phần H): khối tuyến tính $\{u, v, w\}$ và khối tương tác $\{uv, uw, vw\}$ có VIF = 1,000 — trực giao tuyệt đối với mọi cột khác. Chỉ khối bậc hai $\{1, u^2, v^2, w^2\}$ tương quan nhẹ, vì $u^2, v^2, w^2$ đều dương tại điểm giai thừa. Mức tương quan này do số điểm tâm quyết định.
```

| Khối | VIF (n_c = 3) | VIF (n_c = 1) | VIF (n_c = 5) |
|---|---|---|---|
| tuyến tính u, v, w | 1,000 | 1,000 | 1,000 |
| tương tác uv, uw, vw | 1,000 | 1,000 | 1,000 |
| bậc hai u², v², w² | 1,156 | 1,911 | 1,039 |

Với n_c = 3, VIF bậc hai chỉ 1,156 ($R^2 = 0{,}135$); n_c = 1 đẩy lên 1,911 — sai số chuẩn của hệ số cong nhân $\sqrt{1{,}911} = 1{,}38$; n_c = 5 hạ xuống 1,039 (×1,02). Điểm tâm "trộn" các cột bậc hai với hằng số, làm chúng bớt trùng nhau — thêm một lý do chọn n_c ≥ 3, không chỉ để ước lượng sai số thuần (Cạm bẫy 4).

Thiết kế tùy tiện nguy hiểm hơn nhiều. Chỉ 8 điểm giai thừa, không điểm sao: tại mọi điểm $u^2 = v^2 = w^2 = 1$, ba cột trùng nhau — $X^\top X$ có ba trị riêng bằng 0, hạng 8 < 10, VIF vô hạn, $\beta_{uu}, \beta_{vv}, \beta_{ww}$ không ước lượng riêng được (Phần H). CCD đầy đủ có $\mathrm{cond}(X^\top X) = 24{,}9$ (trị riêng từ 2,20 đến 54,8) — lành mạnh.

```remark[Cạm bẫy 2 — hậu quả lên quyết định]
Gradient $\nabla\hat Y = \hat b + 2\hat B u$ được dựng từ các hệ số ước lượng; nếu các hệ số tương quan, hướng leo dốc nhiễu và mỗi lần tái ước lượng cho hướng khác. Kiểm tra trước khi tin kết quả: VIF của mọi cột (ngưỡng thực hành VIF > 5 là đáng ngờ, > 10 là nghiêm trọng — xem loạt bài *Thống kê cơ bản cho khoa học sự sống*, Phần 6) và $\mathrm{cond}(X^\top X)$.
```

```remark[Cạm bẫy 3 — một đáp ứng duy nhất]
Hiệu suất cao thường đi kèm hàm lượng tạp cao: dung môi mạnh và nhiệt độ cao chiết được nhiều flavonoid nhưng cũng chiết nhiều tạp. Với hai đáp ứng $Y_1$ (hiệu suất) và $Y_2$ (tạp), không tồn tại "nghiệm tối ưu nhất" — chỉ có biên Pareto: tập các điểm không thể cải thiện một đáp ứng mà không làm xấu đáp ứng kia. Chọn điểm nào trên biên là quyết định của người làm, không phải của thuật toán.

Ví dụ định lượng: giả sử tạp $Y_2 = 2{,}0 + 0{,}02(T-60) + 0{,}03(C-55)$ (mg/g) tăng theo cả nhiệt độ và ethanol. Cắt ethanol từ 70 xuống 65 ở $T = 73{,}4$: hiệu suất giảm $14{,}64 \to 14{,}13$ (−0,51) nhưng tạp giảm $2{,}72 \to 2{,}57$ (−0,15). Nếu tái tối ưu nhiệt độ sau mỗi lần cắt ethanol, ta quét được biên:
```

| C (%) | T* (°C) | Y₁ (mg/g) | Y₂ (mg/g) |
|---|---|---|---|
| 70 | 73,4 | 14,64 | 2,72 |
| 65 | 72,5 | 14,14 | 2,55 |
| 60 | 71,6 | 13,21 | 2,38 |
| 55 | 70,7 | 11,86 | 2,21 |

Độ dốc của biên — hiệu suất mất đi trên mỗi đơn vị tạp giảm — tăng dần 3,0 → 5,5 → 7,9 khi kéo tạp xuống: biên lồi, lợi suất giảm dần. Điểm trên biên tuỳ thuộc giá trị tương đối của flavonoid và tạp. Khi có ngưỡng tạp (ví dụ $Y_2 \le 2{,}5$), bài toán trở lại một mục tiêu: nghiệm là giao của biên với ngưỡng, ở đây $C \approx 63{,}5$, $T \approx 72{,}2$, $Y_1 \approx 13{,}9$ — thấp hơn "cực đại hiệu suất" 14,6 vì phải trả giá cho tạp.

Cách giải khi nhiều đáp ứng: cực đại $Y_1$ với ràng buộc $Y_2 \le \varepsilon$ (phương pháp $\varepsilon$-constraint) vén được toàn bộ biên kể cả phần lõm; cực đại tổng trọng số $w_1 Y_1 + w_2 Y_2$ chỉ vén được phần lồi (Phần E). Đây không phải chi tiết kỹ thuật: nếu biên lõm, tổng trọng số bỏ sót chính đoạn mà người làm có thể quan tâm.

```remark[Cạm bẫy 4 — quá ít bậc tự do]
CCD ba biến có $n = 17$ thí nghiệm cho $p = 10$ tham số: $df = n - p = 7$ bậc tự do sai số. Tổng bình phương sai số phân rã thành hai phần:
$$SS_{res} = SS_{PE} + SS_{LOF},$$
với $SS_{PE}$ (sai số thuần) ước lượng từ $n_c$ điểm tâm lặp — $df_{PE} = n_c - 1 = 2$ — và $SS_{LOF}$ (lack-of-fit) là phần mô hình không giải thích được, $df_{LOF} = 5$. Kiểm định lack-of-fit dùng tỉ số
$$F = \frac{SS_{LOF}/5}{SS_{PE}/2} \sim F(5, 2).$$

Với $df_{PE} = 2$, kiểm định gần như mù: ngưỡng bác bỏ $F_{0{,}05;\,5,2} = 19{,}30$ — $SS_{LOF}$ phải gấp khoảng 48 lần $SS_{PE}$ mới đáng ngờ. Thêm điểm tâm hạ ngưỡng ngay: $n_c = 10$ cho $F_{0{,}05;\,5,9} = 3{,}48$. Định lượng bằng công suất — giả sử hàm thật có số hạng bậc ba $c u^3$ với $\sigma = 0{,}05$; tham số không trung tâm $\lambda = SS_{LOF}/\sigma^2$ bằng 11,1 ($c = 0{,}05$) hoặc 44,3 ($c = 0{,}1$), không đổi theo $n_c$ vì phần thiết kế ngoài tâm giống nhau. Mô phỏng 1500 lần:
```

| λ | Công suất (n_c = 3) | Công suất (n_c = 10) |
|---|---|---|
| 11,1 | 16% | 46% |
| 44,3 | 41% | 98% |

Cùng một mức sai lệch, tăng điểm tâm từ 3 lên 10 biến kiểm định từ gần như mù thành gần như chắc chắn.

Hậu quả của việc bỏ sót lack-of-fit là thiên lệch có cấu trúc, không phải nhiễu: số hạng $c u^3$ chiếu lên cột $u$ ($\sum_i u_i \cdot u_i^3 = 24 \neq 0$), nên mô hình bậc hai "nuốt" nó vào hệ số tuyến tính. Với $c = 0{,}1$ (lệch khoảng 0,5 mg/g tại điểm sao, cỡ 10σ), $\hat\beta_u$ khớp từ dữ liệu không nhiễu bằng 0,48 thay vì 0,30 — thiên lệch 59% ở chính hệ số quyết định hướng leo dốc.

Hệ quả thực hành: tăng $n_c$ là cách rẻ nhất thêm bậc tự do — mỗi điểm tâm thêm 1 df, không đổi cấu trúc trực giao, đồng thời hạ VIF khối bậc hai (Cạm bẫy 2) và siết ước lượng $\sigma$.

```remark[Cạm bẫy 5 — báo cáo thiếu độ bất định]
"$Y^* = 14{,}64$ mg/g" không kèm độ bất định là một con số gần như vô nghĩa. Phần I đã cho ba con số, mỗi con số kể một câu chuyện khác nhau: khoảng 95% của $Y^*$ cỡ $[5{,}5;\, 16{,}6]$ (Monte Carlo 20 000 lần rút, có điều kiện lõm) — độ cao; SD 5,5 °C của $T^*$ — vị trí; và khoảng tin cậy của trung bình dự đoán tại nghiệm $[-7{,}5;\, 36{,}8]$ (Cạm bẫy 1) — độ tin của dự đoán. Cả ba đều cần trong báo cáo.

Quy tắc viết: (1) báo cáo nghiệm kèm độ phân tán của từng toạ độ; (2) báo cáo $Y^*$ kèm khoảng, không kèm một số; (3) nêu rõ miền thiết kế mà mô hình đáng tin (Cạm bẫy 1); (4) kết thúc bằng xác nhận thực nghiệm hai giai đoạn (Phần D). Một báo cáo đầy đủ có dạng:

> Điều kiện đề xuất: $T = 73{,}4 \pm 5{,}5$ °C, $C = 70$ (biên ràng buộc), $t = 90$ phút. Hiệu suất dự đoán 14,6 mg/g, khoảng 95% [5,5; 16,6]. Chạy 3–5 mẻ tại điểm này để xác nhận trước khi công bố.

Mọi báo cáo kết thúc bằng xác nhận thực nghiệm hai giai đoạn: mô hình định vị, thực nghiệm định lượng.
```

```example[Kiểm định lack-of-fit trên dữ liệu CCD]
Dùng đúng bộ 17 điểm của Phần A (bảng "Từ 17 phép đo đến hàm ước lượng"); mô hình khớp từ bộ đó:
$$\hat y = 9{,}2081 + 0{,}3004u + 0{,}2612v + 0{,}0881w - 0{,}0298u^2 - 0{,}0312v^2 - 0{,}0119w^2 + 0{,}0153uv - 0{,}0062uw - 0{,}0133vw.$$
Câu hỏi: mô hình bậc hai có đủ tốt trên miền thiết kế không, hay còn cấu trúc bị bỏ sót? Kiểm định lack-of-fit trả lời bằng cách tách sai số thành hai phần.

**Bước 1 — sai số thuần từ ba điểm tâm.** Ba quan sát tại $(0,0,0)$: 9,267; 9,175; 9,186, trung bình 9,2094:
$$SS_{PE} = (9{,}267-9{,}2094)^2 + (9{,}175-9{,}2094)^2 + (9{,}186-9{,}2094)^2 = 0{,}00497, \qquad df_{PE} = 2$$
(tính tay với số làm tròn cho 0,0050). $MS_{PE} = 0{,}00497/2 = 0{,}00248$, nên $\hat\sigma = \sqrt{0{,}00248} = 0{,}0498$ — trùng $\sigma = 0{,}05$ dùng để mô phỏng: kiểm tra hợp lệ.

**Bước 2 — phần dư của mô hình.** Hai ví dụ tính tay. Tại điểm $(1;1;1)$: $\hat y = 9{,}2081 + 0{,}3004 + 0{,}2612 + 0{,}0881 - 0{,}0298 - 0{,}0312 - 0{,}0119 + 0{,}0153 - 0{,}0062 - 0{,}0133 = 9{,}781$, phần dư $9{,}823 - 9{,}781 = +0{,}042$. Tại điểm $(-1;-1;-1)$: $\hat y = 8{,}481$, phần dư $8{,}456 - 8{,}481 = -0{,}025$. Cộng bình phương phần dư của cả 17 điểm: $SS_{res} = 0{,}02184$, $df = 7$.

**Bước 3 — lack of fit.** $SS_{LOF} = SS_{res} - SS_{PE} = 0{,}02184 - 0{,}00497 = 0{,}01687$, $df_{LOF} = 7 - 2 = 5$. Kết quả tóm tắt ở bảng dưới.
```

| Nguồn | SS | df | MS | F | p |
|---|---|---|---|---|---|
| Hồi quy (mô hình bậc hai) | 2,2894 | 9 | 0,2544 | 81,5 | < 0,001 |
| Sai số | 0,02184 | 7 | 0,00312 | | |
| — Lack of fit | 0,01687 | 5 | 0,00337 | 1,36 | 0,48 |
| — Sai số thuần | 0,00497 | 2 | 0,00248 | | |
| Tổng | 2,3113 | 16 | | | |

```remark[Đọc kết quả]
$F = 1{,}36 < F_{0{,}05;\,5,2} = 19{,}30$ ($p = 0{,}48$) — không phát hiện lack of fit; mô hình bậc hai đủ tốt trên miền thiết kế. Đúng kỳ vọng: dữ liệu được sinh từ chính hàm bậc hai cộng nhiễu $\sigma = 0{,}05$, và kiểm định không báo động giả.

Hai lưu ý. Thứ nhất, hai ước lượng $\sigma$ độc lập — $\hat\sigma_{PE} = 0{,}0498$ (từ 3 điểm tâm) và $\hat\sigma_{LOF} = 0{,}0581$ (từ phần lack of fit) — sát nhau, dấu hiệu không có cấu trúc bị bỏ sót; nếu $\hat\sigma_{LOF} \gg \hat\sigma_{PE}$ là mô hình thiếu số hạng, và tỉ số của chúng chính là gốc của $F$. Thứ hai, ngưỡng 19,30 cao vì $df_{PE} = 2$ (Cạm bẫy 4): kiểm định chỉ bắt được lack of fit thô — một số hạng bậc ba vừa phải có thể lọt qua (Phần F cho thấy cơ chế). Kiểm tra bằng nhiều hơn một con số: vẽ phần dư theo từng biến và theo thứ tự chạy thí nghiệm; nếu thấy xu hướng có cấu trúc dù $p$ lớn, vẫn phải xử lý.
```

## Phần E — Mở rộng

```remark[Đa đáp ứng và biên Pareto]
Khi có hai đáp ứng cần cân bằng, chẳng hạn hiệu suất flavonoid $Y_1$ và hàm lượng tạp $Y_2$, không tồn tại một nghiệm "tối ưu nhất" duy nhất mà là một biên Pareto: tập các điều kiện mà không thể cải thiện một đáp ứng mà không làm xấu đáp ứng kia. Hai kỹ thuật chuẩn: cực đại tổng trọng số $w_1 Y_1 + w_2 Y_2$ với $w > 0$, và cực đại $Y_1$ với ràng buộc $Y_2 \le \epsilon$. Cách thứ hai vén được toàn bộ biên Pareto kể cả phần lõm; cách thứ nhất thì không.
```

```remark[Phiên bản bền vững]
Hệ số của mô hình RSM là ước lượng với khoảng tin cậy; nếu ngân sách thực nghiệm nhỏ, bất định này đáng kể. Phiên bản bền vững yêu cầu nghiệm tốt nhất theo nghĩa xấu nhất trên tập hệ số chấp nhận được: $\max_x \min_{\beta \in B} Y(x; \beta)$ cùng các ràng buộc tương ứng. Sự khác biệt giữa hiệu suất tối ưu danh nghĩa và hiệu suất bền vững gọi là **giá của tính bền vững** (price of robustness) — số hiệu suất trả để chắc chắn đạt ngưỡng trong mọi kịch bản chấp nhận được.
```

Khung lý thuyết và cách đo chỉ số này ở Bertsimas và Sim [^5].

```remark[Tối ưu hoá tuần tự và thiết kế thí nghiệm]
Với miền rộng và chưa biết vị trí đỉnh, quy trình hiệu quả là leo dốc theo mô hình bậc nhất (phương pháp steepest ascent của Box–Wilson), chuyển sang mô hình bậc hai khi gần đỉnh, rồi tối ưu như Phần B. Mỗi vòng thực nghiệm bổ sung dữ liệu và thu hẹp miền tìm kiếm; thiết kế thí nghiệm quyết định chất lượng của từng vòng.
```

Phương pháp leo dốc và quy trình bề mặt đáp ứng gắn với Box và Wilson [^1]; nguyên tắc thiết kế thí nghiệm ở Montgomery [^6].

## Phần F — Khi hàm thật không bậc hai

Mô hình bậc hai là xấp xỉ Taylor bậc hai của hàm thật quanh tâm thí nghiệm:
$$f(x) = f(x_0) + \nabla f(x_0)^\top (x - x_0) + \tfrac12 (x-x_0)^\top H(x_0)(x-x_0) + O(\|x-x_0\|^3).$$
Câu hỏi đúng không phải "hàm thật có bậc hai không" mà là "sai số bậc ba có đáng kể trên miền khả thi không". Phần này phân tích cơ chế sai số bằng một ví dụ một biến, rồi đưa cách phát hiện và xử lý.

```example[Đỉnh dịch chuyển khi có số hạng bậc ba]
Xét một biến thu gọn $x$ (chẳng hạn $x = (T-60)/5$ dọc theo hướng nhiệt độ) và hàm thật $f(x) = x^2 - 0{,}1 x^3$: gần gốc, $f$ tăng theo $x^2$; xa gốc, số hạng $-0{,}1x^3$ uốn đường cong xuống. Thí nghiệm tại $x = 0, 1, 2$ cho $0$; $0{,}9$; $3{,}2$. Khớp bậc hai qua ba điểm cho $\hat y = 0{,}2x + 0{,}7x^2$, đi qua đúng ba điểm — từ ba điểm này không có cách nào phát hiện số hạng bậc ba.

Cực đại thật: $f'(x) = 2x - 0{,}3x^2 = 0$, $x^* = 20/3 \approx 6{,}67$, $f^* \approx 14{,}81$, và $f''(x^*) = -2 < 0$. Mô hình khớp là hàm lồi ($0{,}7 > 0$) tăng trên $[0, 8]$, nên KKT đẩy nghiệm ra biên $x = 8$: dự đoán $\hat y(8) = 46{,}4$, trong khi giá trị thật tại đó là $12{,}8$ — thấp hơn đỉnh thật $13{,}6\%$. Leo tiếp ra ngoài còn tệ hơn: $f(9) = 8{,}1$. Sai số bậc ba nhỏ trong vùng lấy mẫu ($|{-}0{,}1x^3| \le 0{,}8$ tại $x \le 2$) nhưng tích luỹ thành sai số lớn khi dùng mô hình ngoài vùng đó.
```

```remark[Phần dư Taylor: sai số đúng là gì]
Khai triển Taylor của hàm trơn $f$ quanh $0$ đến bậc hai có phần dư Lagrange:
$$f(x) = f(0) + f'(0)x + \tfrac{1}{2}f''(0)x^2 + \frac{f'''(\xi)}{6}x^3, \qquad \xi \in (0, x).$$
Với $f(x) = x^2 - 0{,}1x^3$, mọi đạo hàm bậc cao hơn ba triệt tiêu và $f'''(\xi) = -0{,}6$ là hằng số, nên phần dư đúng bằng $-0{,}1x^3$: tại $x = 8$ là $-51{,}2$, và mô hình bậc hai dự đoán $x^2 = 64$ trong khi giá trị thật là $12{,}8$. Sai số định vị đỉnh vì thế không phải nhiễu ngẫu nhiên — nó là phần dư Taylor có cấu trúc, và tỉ số $|f'''|/|f''|$ quyết định mức độ nghiêm trọng. Với hàm bậc hai thật ($f''' = 0$) mô hình không có sai số hệ thống, chỉ còn nhiễu; với hàm có $f''' \neq 0$, sai số hệ thống tăng như $x^3$ khi ra xa tâm. Kiểm tra lack-of-fit thực chất là kiểm tra xem $f'''$ và các đạo hàm bậc cao có đáng kể trên miền khả thi hay không.
```

```remark[KKT chỉ là điều kiện địa phương]
Mô hình bậc hai với ma trận $B$ âm xác định có đúng một đỉnh; nếu hàm thật có hai đỉnh hoặc một yên ngựa trong miền khả thi, nghiệm KKT của mô hình chỉ thấy đỉnh gần tâm thiết kế nhất. KKT và giá bóng vẫn là định lý đúng cho bất kỳ hàm trơn nào — vấn đề là ta đang giải bài toán của mô hình, không phải của thực tế, nên $\lambda$ đo giá trị ràng buộc trong thế giới mô hình. Với hàm đa cực trị: vẽ bề mặt, thử nhiều điểm khởi đầu, hoặc dùng phương pháp toàn cục (simulated annealing, differential evolution).
```

```remark[Phát hiện và bốn hướng xử lý]
Khớp bậc hai qua các điểm mức khác nhau không thể phát hiện bậc ba: cần replicate tại tâm để ước lượng sai số thuần (pure error), rồi chạy lack-of-fit test; nếu lack-of-fit có ý nghĩa, bậc hai chưa đủ trên miền này.

Khi đó có bốn hướng. Mô hình bậc ba, với thiết kế bổ sung điểm (CCD mở rộng hoặc Box–Behnken bậc cao hơn). Thu hẹp miền khả thi để số hạng bậc cao nhỏ trên miền — đúng tình huống bài này: các biên $T \le 75$, $C \le 70$, $t \le 90$ giữ nghiệm gần tâm thiết kế, nơi xấp xỉ bậc hai đáng tin. Phi tham số: Bayesian optimization với Gaussian process — không giả định dạng hàm, cập nhật posterior từ mỗi điểm đo, acquisition function cân bằng khai thác–thăm dò; thích hợp khi mỗi thí nghiệm đắt tiền và hàm có thể đa cực trị. Mô hình cơ chế: nếu biết động học hoặc nhiệt động của quá trình chiết, dùng mô hình vật lý thay mô hình thực nghiệm — ít tham số hơn và ngoại suy tốt hơn.
```

## Lộ trình tiếp theo

Bài viết này trình bày trọn quy trình cho ba biến. Với nhiều biến hơn, lời giải KKT vẫn đúng nhưng việc tính tay thay bằng một bộ giải số; phần lý thuyết đầy đủ của các công cụ ở đây — mô hình hoá, KKT, giá bóng, tối ưu bền vững, đa mục tiêu — có trong bài tổng quan *Tối ưu hoá cho quyết định*. Với người đọc muốn nối với thống kê: hồi quy đa biến ở loạt bài *Thống kê cơ bản cho khoa học sự sống* (Phần 6) cho cách ước lượng và kiểm định hệ số mô hình bậc hai, còn phân tích dữ liệu phổ và chemometrics (Phần 11) mở đường cho các đáp ứng đo bằng thiết bị. Phần F đặt câu hỏi khi nào xấp xỉ bậc hai không đủ; khi mỗi thí nghiệm đắt tiền và hàm đáp ứng không có dạng đã biết, bước tiếp theo tự nhiên là Bayesian optimization với Gaussian process.

[^1]: G. E. P. Box and K. B. Wilson, "On the experimental attainment of optimum conditions," *Journal of the Royal Statistical Society B* 13(1): 1–45, 1951.
[^2]: R. H. Myers, D. C. Montgomery and C. M. Anderson-Cook, *Response Surface Methodology: Process and Product Optimization Using Designed Experiments*, 4th ed., Wiley, 2016.
[^3]: S. Boyd and L. Vandenberghe, *Convex Optimization*, Cambridge University Press, 2004.
[^4]: W. Karush, "Minima of functions of several variables with inequalities as side conditions," luận án, University of Chicago, 1939; H. W. Kuhn and A. W. Tucker, "Nonlinear programming," *Proceedings of the Second Berkeley Symposium on Mathematical Statistics and Probability*, 481–492, 1951.
[^5]: D. Bertsimas and M. Sim, "The price of robustness," *Operations Research* 52(1): 35–53, 2004.
[^6]: D. C. Montgomery, *Design and Analysis of Experiments*, 9th ed., Wiley, 2017.
[^7]: G. E. P. Box and N. R. Draper, *Response Surfaces, Mixtures, and Ridge Analyses*, 2nd ed., Wiley, 2007.
[^8]: A. Saltelli, M. Ratto, T. Andres, F. Campolongo, J. Cariboni, D. Gatelli, M. Saisana and S. Tarantola, *Global Sensitivity Analysis: The Primer*, Wiley, 2008.
