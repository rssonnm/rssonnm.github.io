---
title: "Tối ưu hoá cho quyết định"
date: 2026-08-11T12:00:00
description: "Tối ưu hoá là ngôn ngữ toán học của quyết định: biến số là phương án, ràng buộc là tính khả thi, hàm mục tiêu là tiêu chí. Bài viết trình bày các công cụ theo ba câu hỏi — tồn tại nghiệm, đặc trưng nghiệm (đối ngẫu, giá bóng, KKT), tính nghiệm (đơn hình, giảm gradient, Newton, branch and bound) — rồi mở rộng sang tối ưu ngẫu nhiên, bền vững, tối ưu với thông tin, tối ưu như trò chơi và suy luận dựa trên mô phỏng. Mỗi khái niệm kèm chứng minh hoặc dẫn giải và ví dụ số tính tay: bài toán khẩu phần, giá bóng, KKT, Newton cho √2, newsvendor, giá của tính bền vững, cực đại entropy, branch and bound."
topic: mathematics
tags: [optimization, linear-programming, convex-optimization, duality, kkt, gradient-descent, newton-method, integer-programming, branch-and-bound, decision-making, tutorial]
featured: false
draft: false
---

Quyết định là việc chọn: chọn khẩu phần cho một trại nuôi, chọn nhiệt độ và dung môi cho một mẻ chiết xuất, chọn số lượng đặt hàng khi nhu cầu chưa biết. Mọi quyết định như vậy đều có chung một hình dạng — một tập phương án khả thi và một tiêu chí để so sánh chúng. Bài toán tối ưu là cách toán học đặt hình dạng đó vào ngôn ngữ chính xác: biến số biểu diễn phương án, ràng buộc biểu diễn tính khả thi, hàm mục tiêu biểu diễn tiêu chí.

Chủ đề này sinh ra từ những quyết định rất trần tục. Năm 1939, Kantorovich [^1] giải bài toán phân bổ sản xuất của nền kinh tế kế hoạch; năm 1945, Stigler [^2] giải bằng số bài toán chi phí tối thiểu của một khẩu phần ăn. Hai công trình độc lập cùng phát hiện một điều: một quyết định bị ràng buộc bởi tài nguyên thường ẩn chứa một cấu trúc tuyến tính giải được. Từ đó sinh ra quy hoạch tuyến tính, thuật toán đơn hình, và một nhận thức có giá trị lâu dài — cấu trúc của bài toán quyết định công cụ giải nó, và cấu trúc đó thường đáng giá hơn cả con số cuối cùng.

Bài viết tổ chức quanh ba câu hỏi mà bất kỳ quyết định dựa trên toán học nào cũng phải trả lời. Thứ nhất, lựa chọn tốt nhất có tồn tại không, và bài toán thuộc lớp dễ hay khó (Phần A–B)? Thứ hai, nghiệm phải thoả điều kiện gì, và những điều kiện đó nói gì với người ra quyết định — nới ràng buộc nào có giá trị, giá bóng của mỗi ràng buộc là bao nhiêu (Phần C–E)? Thứ ba, tính nghiệm bằng thuật toán nào — đơn hình, giảm gradient, Newton, branch and bound, và khi mô hình phức tạp đến mức không viết được likelihood, suy luận dựa trên mô phỏng (Phần F–N)? Các phần H–N đặt ba câu hỏi này trong thế giới có bất định, thông tin và đối thủ. Mỗi khái niệm kèm một chứng minh hoặc dẫn giải và một ví dụ số tính tay; mọi con số đều kiểm chứng được.

## Phần A — Mô hình hoá bài toán quyết định

```definition[Bài toán tối ưu chuẩn]
Một bài toán tối ưu được viết dưới dạng chuẩn
$$\min_{x \in X} \; f(x) \quad \text{s.t.} \quad g_i(x) \le 0 \ (i = 1, \ldots, m), \quad h_j(x) = 0 \ (j = 1, \ldots, p),$$
trong đó $x$ là véc-tơ biến quyết định, $f$ là hàm mục tiêu, $g_i$ và $h_j$ là các ràng buộc bất đẳng thức và đẳng thức, $X$ là tập chấp nhận được của biến (chẳng hạn $\mathbb{R}^n$ hoặc $\mathbb{Z}^n$).
```

Mô hình hoá là việc dịch câu hỏi quyết định sang ngôn ngữ này. Ba thành phần không thể tách rời: nếu thiếu ràng buộc, bài toán cho kết quả vô nghĩa (thường là vô cùng); nếu thiếu mục tiêu, mọi phương án đều "tối ưu". Bài toán khẩu phần dưới đây là ví dụ chạy xuyên bài: nó được giải lại bằng đơn hình (Phần C), bằng đối ngẫu và giá bóng (Phần D), rồi trong tình huống bất định (Phần J).

```example[Bài toán khẩu phần (diet problem)]
Một trại nuôi cần mua hai loại thức ăn, ký hiệu $A$ và $B$, với giá lần lượt 4 và 3 (đơn vị tiền) cho mỗi kg. Mỗi kg $A$ chứa 3 đơn vị protein, 2 đơn vị năng lượng và 1 đơn vị xơ; mỗi kg $B$ chứa 1, 4 và 5 đơn vị tương ứng. Yêu cầu tối thiểu: 6 đơn vị protein, 8 đơn vị năng lượng; yêu cầu tối đa: 10 đơn vị xơ.

Gọi $x, y$ là số kg thức ăn $A, B$. Bài toán:
$$\min \; 4x + 3y \quad \text{s.t.} \quad 3x + y \ge 6, \quad 2x + 4y \ge 8, \quad x + 5y \le 10, \quad x, y \ge 0.$$
Mục tiêu là chi phí, biến là khối lượng, ràng buộc là dinh dưỡng. Đây là một quy hoạch tuyến tính (LP): mọi hàm đều tuyến tính.
```

```theorem[Weierstrass: tồn tại nghiệm]
Nếu $f$ liên tục trên tập compact khác rỗng $K \subset \mathbb{R}^n$ thì $f$ đạt giá trị nhỏ nhất trên $K$.

*Chứng minh.* Ảnh $f(K)$ của tập compact qua hàm liên tục là tập compact trong $\mathbb{R}$, do đó bị chặn dưới; gọi $m = \inf f(K)$. Tồn tại dãy $x_k \in K$ với $f(x_k) \to m$. Vì $K$ compact, dãy $x_k$ có dãy con hội tụ $x_{k_j} \to x^* \in K$. Tính liên tục cho $f(x^*) = \lim_j f(x_{k_j}) = m$. $\blacksquare$
```

Weierstrass trả lời câu hỏi tồn tại trước khi nói tới thuật toán. Với các bài toán thực hành, miền khả thi thường đóng và bị chặn theo từng biến, hoặc hàm mục tiêu "bức" (coercive), tức $f(x) \to +\infty$ khi $\|x\| \to \infty$, nên tập mức dưới là compact và định lý áp dụng được.

```remark[Ba thành phần và bốn cách phân loại]
Mọi bài toán tối ưu xác định bởi ba thành phần: biến, ràng buộc, mục tiêu. Bốn cách phân loại quyết định công cụ được dùng.

1. **Tuyến tính hay không.** Hàm tuyến tính: LP, giải bằng đơn hình hoặc điểm trong. Phi tuyến: cần phân tích đạo hàm.
2. **Lồi hay không lồi.** Bài toán lồi: cực tiểu địa phương là cực tiểu toàn cục (Phần B); không lồi: chỉ hứa được nghiệm địa phương trừ khi có cấu trúc đặc biệt.
3. **Liên tục hay rời rạc.** Biến nguyên (số máy, số lô, quyết định chọn/không chọn) dẫn tới tối ưu nguyên, khó hơn hẳn (Phần G).
4. **Chắc chắn hay bất định.** Tham số biết trước hay dao động; bất định dẫn tới tối ưu bền vững và ngẫu nhiên (Phần H).
```

## Phần B — Lồi: lớp bài toán "dễ"

```definition[Tập lồi và hàm lồi]
Tập $C$ là **lồi** nếu với mọi $x, y \in C$ và $\theta \in [0, 1]$ thì $\theta x + (1-\theta) y \in C$. Hàm $f$ xác định trên tập lồi $C$ là **lồi** nếu
$$f(\theta x + (1-\theta) y) \le \theta f(x) + (1-\theta) f(y) \qquad \forall x, y \in C,\ \theta \in [0,1].$$
Hàm $f$ là **lõm** nếu $-f$ lồi.
```

Diễn giải hình học (Hình 1): với hàm lồi, dây cung nối hai điểm bất kỳ của đồ thị nằm phía trên đồ thị, và tiếp tuyến tại mọi điểm nằm phía dưới đồ thị. Hàm $f(x) = x^2$ lồi; $f(x) = x^3 - 3x$ không lồi vì dây cung nối hai điểm quanh gốc nằm dưới đồ thị. Định nghĩa trên tương đương với bất đẳng thức tiếp tuyến: $f(y) \ge f(x) + \nabla f(x)^\top (y - x)$ với mọi $x, y$ (với $f$ khả vi).

<figure style="margin:1.8em 0;"><img src="/img/opt/convex.svg" alt="Hàm lồi và hàm không lồi" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — (a) f(x) = x²: dây cung nằm trên đồ thị, tiếp tuyến nằm dưới — hàm lồi. (b) f(x) = x³ − 3x: dây cung nằm dưới đồ thị — không lồi. Tính lồi là điều kiện đủ để bài toán có cấu trúc thuận lợi.</figcaption></figure>

```theorem[Bất đẳng thức Jensen]
Với $f$ lồi, các điểm $x_1, \ldots, x_n$ và trọng số $\theta_i \ge 0$, $\sum_i \theta_i = 1$:
$$f\!\left(\sum_{i=1}^n \theta_i x_i\right) \le \sum_{i=1}^n \theta_i f(x_i).$$
Dạng xác suất: với biến ngẫu nhiên $X$, $f(\mathbb{E}[X]) \le \mathbb{E}[f(X)]$.

*Chứng minh.* Quy nạp theo $n$. Với $n = 2$ đây chính là định nghĩa. Giả sử đúng cho $n-1$; đặt $S = \sum_{i=1}^{n-1} \theta_i$ và $\theta_i' = \theta_i / S$. Khi đó
$$f\!\left(\sum_{i=1}^n \theta_i x_i\right) = f\!\left(S \sum_{i=1}^{n-1} \theta_i' x_i + \theta_n x_n\right) \le S f\!\left(\sum_{i=1}^{n-1} \theta_i' x_i\right) + \theta_n f(x_n),$$
rồi áp dụng giả thiết quy nạp cho số hạng đầu. $\blacksquare$
```

```theorem[Cực tiểu địa phương của hàm lồi là cực tiểu toàn cục]
Cho $f$ lồi trên tập lồi $C$. Nếu $x^* \in C$ là cực tiểu địa phương thì $x^*$ là cực tiểu toàn cục.

*Chứng minh.* Với $y \in C$ bất kỳ, với $t > 0$ đủ nhỏ, điểm $z_t = (1-t) x^* + t y$ nằm trong lân cận của $x^*$, nên $f(x^*) \le f(z_t)$. Tính lồi cho
$$f(z_t) \le (1-t) f(x^*) + t f(y).$$
Kết hợp hai bất đẳng thức: $f(x^*) \le (1-t) f(x^*) + t f(y)$, suy ra $f(x^*) \le f(y)$. $\blacksquare$
```

Hệ quả thực hành: với bài toán lồi, mọi thuật toán tìm điểm dừng (đạo hàm bằng 0) tự động cho nghiệm toàn cục, không cần dò nhiều điểm khởi đầu. Đây là lý do lớp bài toán lồi có thuật toán đáng tin; hai tài liệu chuẩn là Boyd và Vandenberghe [^14] và Rockafellar [^15] cho giải tích lồi.

```remark[Ba góc nhìn của tính lồi]
Cùng một khái niệm, ba ngôn ngữ. **Hình học**: đồ thị nằm dưới dây cung và trên tiếp tuyến; tập mức dưới $\{f \le c\}$ là tập lồi; mọi cực tiểu địa phương là toàn cục (định lý trên). **Xác suất–thống kê**: bất đẳng thức Jensen là nguồn của mọi cận dạng "hàm của kỳ vọng $\le$ kỳ vọng của hàm", và cực tiểu hoá hàm lồi là khung chung của hợp lý tối đa, hồi quy bình phương tối thiểu và kiểm định tỉ số khả dĩ ở loạt bài thống kê. **Lý thuyết thông tin**: entropy là hàm **lõm** theo phân phối, $H(\theta p + (1-\theta) q) \ge \theta H(p) + (1-\theta) H(q)$ — trộn hai phân phối không bao giờ giảm entropy; đây là nguyên lý đứng sau cực đại entropy ở Phần K.
```

## Phần C — Quy hoạch tuyến tính

```definition[Quy hoạch tuyến tính dạng bất đẳng thức]
Một quy hoạch tuyến tính (LP) có dạng
$$\min \; c^\top x \quad \text{s.t.} \quad Ax \ge b, \quad x \ge 0,$$
với $A \in \mathbb{R}^{m \times n}$, $b \in \mathbb{R}^m$, $c \in \mathbb{R}^n$. Mọi ràng buộc $\le$, đẳng thức và biến tự do đều đưa về dạng này bằng phép biến đổi chuẩn.
```

```theorem[Định lý cơ bản của quy hoạch tuyến tính]
Xét LP khả thi và bị chặn dưới. Khi đó tồn tại nghiệm tối ưu, và tồn tại một nghiệm tối ưu tại một cực điểm (đỉnh) của đa diện khả thi $\{x : Ax \ge b,\ x \ge 0\}$.

*Chứng minh.* Miền khả thi là đa diện, tức giao hữu hạn của các nửa không gian đóng — tập lồi đóng. Nếu LP bị chặn dưới thì tồn tại nghiệm tối ưu $x^*$ (lập luận tương tự Weierstrass trên tập mức dưới bị chặn). Nếu $x^*$ không phải cực điểm, định lý biểu diễn Minkowski cho đa diện: $x^*$ là tổ hợp lồi của hữu hạn cực điểm $v_1, \ldots, v_k$: $x^* = \sum_i \lambda_i v_i$, $\lambda_i \ge 0$, $\sum \lambda_i = 1$. Khi đó
$$c^\top x^* = \sum_i \lambda_i c^\top v_i \ge \min_i c^\top v_i \ge c^\top x^*,$$
bất đẳng thức cuối vì $x^*$ tối ưu và các $v_i$ khả thi. Vậy đẳng thức xảy ra và cực điểm $v_j$ đạt $\min_i c^\top v_i$ cũng là nghiệm tối ưu. $\blacksquare$
```

Hệ quả: chỉ cần xét hữu hạn đỉnh. Thuật toán đơn hình của Dantzig [^10] đi từ đỉnh này sang đỉnh kề qua một cạnh, mỗi bước không làm xấu đi mục tiêu, và dừng khi không còn cạnh cải thiện — tiêu chuẩn tối ưu là hệ quả của định lý trên. Trình bày chuẩn có ở Chvátal [^11], Bertsimas và Tsitsiklis [^12], Vanderbei [^13].

```example[Đơn hình trên bài toán khẩu phần]
Bài toán khẩu phần ở Phần A có bốn đỉnh khả thi (Hình 2): $(4; 0)$ với chi phí 16, $(10; 0)$ với 40, $(1{,}43; 1{,}71)$ với 10,86, và $(1{,}6; 1{,}2)$ với 10,0.

Đơn hình bắt đầu tại một đỉnh, chẳng hạn $(4; 0)$ (chi phí 16). Từ đây có hai cạnh: dọc theo $y = 0$ tới $(10; 0)$, chi phí tăng lên 40; dọc theo $2x + 4y = 8$ tới $(1{,}6; 1{,}2)$, chi phí giảm còn 10. Di chuyển theo cạnh giảm chi phí. Tại $(1{,}6; 1{,}2)$, hai cạnh kề là tới $(1{,}43; 1{,}71)$ (chi phí 10,86) và tới $(4; 0)$ (16); cả hai đều tăng, nên dừng. Nghiệm tối ưu: $x = 1{,}6$ kg, $y = 1{,}2$ kg, chi phí $10{,}0$.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/lp-geometry.svg" alt="Miền khả thi của bài toán khẩu phần" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Miền khả thi của bài toán khẩu phần là đa giác lồi; các đường mức 4x + 3y = c song song; tối ưu tại đỉnh (1,6 ; 1,2). Đỉnh (10 ; 0) khả thi nhưng chi phí 40 — tối ưu không phải là đỉnh "lớn nhất".</figcaption></figure>

```remark[Độ phức tạp: đơn hình và điểm trong]
Đơn hình chạy nhanh trong thực hành nhưng tồn tại ví dụ với số bước mũ theo số biến. Thuật toán điểm trong đảm bảo đa thức và trong thực hành cạnh tranh với đơn hình; các bộ giải hiện đại phối hợp cả hai.
```

Ví dụ xấu do Klee và Minty [^3] xây dựng; điểm trong có nguồn gốc từ Karmarkar [^4], còn họ primal–dual trình bày ở Wright [^19].

## Phần D — Đối ngẫu và giá bóng

```definition[LP đối ngẫu]
Với LP gốc $\min c^\top x$ sao cho $Ax \ge b$, $x \ge 0$, bài toán **đối ngẫu** là
$$\max \; b^\top y \quad \text{s.t.} \quad A^\top y \le c, \quad y \ge 0.$$
Mỗi ràng buộc của bài toán gốc ứng với một biến đối ngẫu $y_i$; mỗi biến gốc ứng với một ràng buộc đối ngẫu.
```

```theorem[Đối ngẫu yếu]
Với mọi $x$ khả thi của bài toán gốc và mọi $y$ khả thi của bài toán đối ngẫu: $c^\top x \ge b^\top y$.

*Chứng minh.* Từ $A^\top y \le c$ và $x \ge 0$: $c^\top x \ge (A^\top y)^\top x = y^\top A x$. Từ $Ax \ge b$ và $y \ge 0$: $y^\top A x \ge y^\top b = b^\top y$. Kết hợp hai bất đẳng thức. $\blacksquare$
```

Hệ quả: mỗi nghiệm đối ngẫu khả thi cho một **cận dưới** của giá trị tối ưu gốc. Nếu tìm được $x$ và $y$ với $c^\top x = b^\top y$, cả hai đều tối ưu — không cần tiêu chuẩn khác.

```theorem[Đối ngẫu mạnh]
Nếu bài toán gốc khả thi và bị chặn dưới thì bài toán đối ngẫu khả thi và $\min c^\top x = \max b^\top y$.

*Dẫn giải.* Định lý này có từ công trình của von Neumann gắn với lý thuyết trò chơi. Chứng minh chuẩn dùng định lý tách siêu phẳng (hoặc bổ đề Farkas): nếu không tồn tại $y$ thoả $A^\top y \le c$, $y \ge 0$, $b^\top y = c^\top x^*$ với $x^*$ tối ưu, thì một siêu phẳng tách được tập $\{A^\top y : y \ge 0\}$ khỏi điểm $c$, dẫn tới mâu thuẫn với tính tối ưu của $x^*$. Hệ quả: đối ngẫu là chứng nhận tối ưu — giá trị hai bài toán trùng nhau.
```

Tài liệu gốc: von Neumann [^5].

```definition[Giá bóng]
Gọi $v(b)$ là giá trị tối ưu của LP gốc xem như hàm của vế phải $b$ (các ràng buộc còn lại cố định). Với bài toán $\min$, **giá bóng** của ràng buộc thứ $i$ là
$$\lambda_i = -\frac{\partial v}{\partial b_i},$$
tức độ giảm của chi phí tối ưu khi nới vế phải $b_i$ thêm một đơn vị. Theo đối ngẫu mạnh, $\lambda_i = y_i^*$, thành phần thứ $i$ của nghiệm đối ngẫu tối ưu.
```

```example[Giá bóng của bài toán khẩu phần]
Bài toán đối ngẫu của bài toán khẩu phần, với biến $u$ (protein), $v$ (năng lượng), $w$ (xơ):
$$\max \; 6u + 8v - 10w \quad \text{s.t.} \quad 3u + 2v - w \le 4, \quad u + 4v - 5w \le 3, \quad u, v, w \ge 0.$$
Nghiệm tối ưu $u = 1{,}0$, $v = 0{,}5$, $w = 0{,}0$, với giá trị $6 \cdot 1 + 8 \cdot 0{,}5 = 10{,}0$ — trùng giá trị gốc (đối ngẫu mạnh).

Diễn giải quyết định: mỗi đơn vị yêu cầu protein nới ra làm chi phí giảm 1,0; mỗi đơn vị năng lượng nới ra làm giảm 0,5. Ràng buộc xơ có giá bóng 0: tại nghiệm tối ưu, lượng xơ $1{,}6 + 5 \cdot 1{,}2 = 7{,}6 < 10$, ràng buộc không hoạt động, nên nới nó không đổi gì. Hình 3 vẽ chi phí tối ưu $v(b)$ theo yêu cầu protein $b$: với $b$ quanh 6, đường cong tuyến tính với hệ số góc $-1$, đúng bằng $-u^*$.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/shadow-price.svg" alt="Giá bóng của ràng buộc protein" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Chi phí tối ưu v(b) theo yêu cầu protein b: tuyến tính từng khúc, lồi. Tiếp tuyến tại b = 6 có hệ số góc −λ = −1, với λ = 1,0 là biến đối ngẫu u của ràng buộc protein.</figcaption></figure>

```remark[Phạm vi hiệu lực của giá bóng]
Giá bóng là đạo hàm riêng, chỉ đúng trong lân cận: nó giữ nguyên khi tập ràng buộc hoạt động không đổi. Khi $b_i$ thay đổi đủ lớn để một ràng buộc khác trở thành hoạt động hoặc ngừng hoạt động, hệ số góc của $v$ đổi giá trị (đường gấp khúc ở Hình 3). Trong thực hành: dùng giá bóng để định hướng, giải lại LP để xác nhận.
```

```remark[Đối ngẫu như trò chơi tổng không]
Cặp gốc–đối ngẫu là một trò chơi: người quyết định chọn $x$ (cực tiểu hoá), đối thủ "bán ràng buộc" chọn $y$ (cực đại hoá); giá trị của trò chơi là chi phí tối ưu, và nghiệm đối ngẫu $y^*$ là chiến lược cân bằng của đối thủ. Định lý minimax của von Neumann (Phần L) là dạng trò chơi của đối ngẫu mạnh. Góc nhìn này giải thích vì sao giá bóng đọc được như "giá thị trường" của một ràng buộc: nó là giá cân bằng trong trò chơi trao đổi ràng buộc.
```

## Phần E — Điều kiện KKT

```definition[Lagrangian]
Với bài toán $\min f(x)$ sao cho $g_i(x) \le 0$, $h_j(x) = 0$, **Lagrangian** là
$$L(x, \lambda, \mu) = f(x) + \sum_{i=1}^m \lambda_i g_i(x) + \sum_{j=1}^p \mu_j h_j(x),$$
với $\lambda \ge 0$ gọi là nhân tử Lagrange của các ràng buộc bất đẳng thức, $\mu$ của các ràng buộc đẳng thức.
```

```theorem[Điều kiện KKT]
Xét bài toán lồi khả vi, với điều kiện Slater (tồn tại điểm thoả mọi ràng buộc bất đẳng thức theo nghĩa chặt). Điểm $x^*$ là nghiệm tối ưu khi và chỉ khi tồn tại $\lambda^* \ge 0$, $\mu^*$ sao cho
$$\nabla_x L(x^*, \lambda^*, \mu^*) = 0, \qquad \lambda_i^* g_i(x^*) = 0 \ \forall i, \qquad g_i(x^*) \le 0, \ h_j(x^*) = 0.$$
Điều kiện $\lambda_i^* g_i(x^*) = 0$ gọi là **độ bù**: một ràng buộc hoặc là hoạt động ($g_i = 0$) hoặc nhân tử của nó bằng 0.

*Chứng minh (chiều đủ).* Giả sử $x^*$, $\lambda^* \ge 0$ thoả các điều kiện. Vì $\lambda^* \ge 0$ và $\nabla_x L = 0$, điểm $x^*$ cực tiểu hoá $L(\cdot, \lambda^*, \mu^*)$ trên toàn không gian (hàm lồi theo $x$ với đạo hàm 0). Với mọi $x$ khả thi: $g_i(x) \le 0$ nên $f(x) \ge L(x, \lambda^*, \mu^*) \ge L(x^*, \lambda^*, \mu^*) = f(x^*)$, đẳng thức cuối nhờ độ bù. Vậy $f(x) \ge f(x^*)$. $\blacksquare$

Chiều ngược lại (điều kiện cần) cần điều kiện Slater; nó dùng đối ngẫu Lagrange và định lý tách.
```

Chứng minh đầy đủ của chiều cần ở Boyd và Vandenberghe [^14]. Lịch sử của điều kiện gắn với Karush (1939) và Kuhn–Tucker (1951) [^24]; điều kiện Slater do Slater [^25] đề xuất.

```example[KKT: phân bổ ngân sách]
Một phòng thí nghiệm phân bổ hai hoạt động $x, y \ge 0$ với tổng ngân sách $x + y \le 4$; chi phí hiệu quả ngược với khoảng cách tới điểm lý tưởng $(3; 3)$:
$$\min \; f(x,y) = (x-3)^2 + (y-3)^2 \quad \text{s.t.} \quad x + y \le 4.$$
Nghiệm không ràng buộc $(3; 3)$ vi phạm ngân sách, nên ràng buộc hoạt động. Lagrangian: $L = (x-3)^2 + (y-3)^2 + \lambda(x + y - 4)$. Điều kiện đạo hàm:
$$\frac{\partial L}{\partial x} = 2(x-3) + \lambda = 0, \qquad \frac{\partial L}{\partial y} = 2(y-3) + \lambda = 0,$$
cho $x = y = 3 - \lambda/2$. Từ $x + y = 4$: $6 - \lambda = 4$, vậy $\lambda = 2$, $x = y = 2$. Kiểm tra độ bù: $\lambda(x + y - 4) = 2 \cdot 0 = 0$. Nghiệm $(2; 2)$, chi phí $f = 2$.

Nhân tử $\lambda = 2$ là giá bóng: chi phí tối ưu như hàm của ngân sách $b$ là $v(b) = (b - 6)^2 / 2$ với $b \le 6$; $v(4) = 2$, $v(4{,}5) = 1{,}125$, $v(5) = 0{,}5$, và $v'(4) = 4 - 6 = -2 = -\lambda$. Tăng ngân sách 0,5 đơn vị giảm chi phí xấp xỉ 1,0.
```

```remark[KKT với bài toán không lồi]
Với bài toán không lồi, KKT chỉ là điều kiện cần: điểm thoả KKT có thể là cực tiểu, cực đại hoặc điểm yên ngựa. Thực hành chuẩn là khởi động từ nhiều điểm, kiểm tra KKT tại mỗi điểm dừng, và nếu có thể, chứng minh lồi trước khi tuyên bố tối ưu toàn cục.
```

```remark[Hình học của KKT: nón pháp tuyến]
Với bài toán $\min f$ trên tập lồi $C$ (mọi ràng buộc gộp vào $C$), điều kiện tối ưu có dạng hình học thuần tuý: $-\nabla f(x^*) \in N_C(x^*)$, với $N_C(x)$ là **nón pháp tuyến** — tập các hướng tạo góc tù với mọi hướng khả thi xuất phát từ $x$. KKT là bản khai triển của điều kiện này khi $C$ được mô tả bằng bất đẳng thức: nón pháp tuyến sinh bởi gradient của các ràng buộc hoạt động với hệ số không âm (đó là độ bù). Phép chiếu lên $C$ — nền tảng của phương pháp chiếu gradient — cũng là giao điểm với nón pháp tuyến.
```

## Phần F — Phương pháp số cho tối ưu không ràng buộc

```theorem[Điều kiện cần và đủ bậc hai]
Cho $f$ khả vi liên tục hai lần trên $\mathbb{R}^n$. Điều kiện cần để $x^*$ là cực tiểu địa phương: $\nabla f(x^*) = 0$ và $\nabla^2 f(x^*)$ nửa xác định dương. Điều kiện đủ: $\nabla f(x^*) = 0$ và $\nabla^2 f(x^*)$ xác định dương.

*Dẫn giải.* Khai triển Taylor bậc hai tại $x^*$: $f(x^* + d) = f(x^*) + \nabla f(x^*)^\top d + \tfrac12 d^\top \nabla^2 f(x^*) d + o(\|d\|^2)$. Nếu $\nabla f(x^*) \ne 0$, chọn $d = -\nabla f(x^*)$ với $\|d\|$ nhỏ làm $f$ giảm — mâu thuẫn. Nếu Hessian có véc-tơ riêng $d$ với trị riêng âm, đi theo $d$ làm giảm $f$ — mâu thuẫn. Chiều đủ: dạng toàn phương xác định dương trội hơn số hạng bậc cao với $\|d\|$ đủ nhỏ.
```

```definition[Hàm L-trơn]
Hàm $f$ là **L-trơn** nếu gradient của nó Lipschitz với hằng số $L$:
$$\|\nabla f(x) - \nabla f(y)\| \le L \|x - y\| \qquad \forall x, y.$$
Hằng số $L$ chặn trên độ cong: với hàm bậc hai $f(x) = \tfrac12 x^\top Q x$, ta có $L = \lambda_{\max}(Q)$.
```

```lemma[Bổ đề giảm đủ]
Cho $f$ lồi, $L$-trơn và $x^+ = x - \frac{1}{L}\nabla f(x)$. Khi đó
$$f(x^+) \le f(x) - \frac{\|\nabla f(x)\|^2}{2L}.$$

*Chứng minh.* Với hàm $L$-trơn có bất đẳng thức chuẩn (descent lemma): $f(y) \le f(x) + \nabla f(x)^\top (y-x) + \frac{L}{2}\|y-x\|^2$, suy ra từ tích phân $\nabla f(x + t(y-x)) - \nabla f(x)$ dọc theo đoạn thẳng. Thay $y = x^+$: số hạng tuyến tính bằng $-\|\nabla f\|^2 / L$, số hạng bậc hai bằng $\|\nabla f\|^2 / (2L)$; cộng lại được $-\|\nabla f\|^2 / (2L)$. $\blacksquare$
```

```theorem[Hội tụ O(1/k) của giảm gradient]
Cho $f$ lồi, $L$-trơn, với cực tiểu $f^*$ tại $x^*$. Giảm gradient với bước cố định $1/L$ thoả
$$f(x_k) - f^* \le \frac{L \|x_0 - x^*\|^2}{2k}.$$

*Dẫn giải.* Từ bổ đề giảm đủ và tính lồi ($f(x_k) - f^* \le \nabla f(x_k)^\top (x_k - x^*) \le \|\nabla f(x_k)\| \cdot \|x_k - x^*\|$), cộng dồn các bước và dùng tính không tăng của $\|x_k - x^*\|$ cho ra cận trên. Sai số giảm như $1/k$: để đạt độ chính xác $\epsilon$ cần $O(1/\epsilon)$ bước — chậm nhưng chắc chắn, không cần tham số nào ngoài $L$.
```

Phương pháp này có từ Cauchy [^22]; trình bày hiện đại ở Nocedal và Wright [^16], Luenberger và Ye [^17], Bertsekas [^18], Polyak [^23].

```example[Giảm gradient và Newton trên hàm bậc hai]
Xét $f(x, y) = (x-2)^2 + 3(y+1)^2$, Hessian $\text{diag}(2, 6)$, nên $L = 6$ và độ lồi mạnh $m = 2$. Bắt đầu từ $(0; 3)$.

- **Giảm gradient**, bước $1/L = 1/6$: hướng chậm nhất (trục $x$) co lại với hệ số $1 - m/L = 2/3$ mỗi bước; sau 8 bước đạt $(1{,}92; -1)$ với $f = 0{,}0061$ (Hình 4a).
- **Newton**, $x_{k+1} = x_k - \nabla^2 f(x_k)^{-1} \nabla f(x_k)$: với hàm bậc hai, một bước tới đúng cực tiểu $(2; -1)$ (Hình 4b).

Với hàm bậc hai, Newton loại bỏ ảnh hưởng của độ cong — hội tụ một bước; với hàm tổng quát, nó hội tụ bậc hai (định lý dưới).
```

<figure style="margin:1.8em 0;"><img src="/img/opt/gd-newton.svg" alt="Giảm gradient so với Newton" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Đường mức của f = (x−2)² + 3(y+1)². (a) Giảm gradient bước 1/6: đường gấp khúc tiến về cực tiểu, sau 8 bước f = 0,0061. (b) Newton: một bước tới (2 ; −1). Hướng của Newton không vuông góc với đường mức nhưng đúng tâm của ellipsoid.</figcaption></figure>

```theorem[Newton hội tụ bậc hai]
Cho $f$ khả vi ba lần liên tục, $\nabla^2 f$ xác định dương đều ($\nabla^2 f(x) \succeq m I$ với $m > 0$) và Lipschitz trên lân cận nghiệm $x^*$ với $\nabla f(x^*) = 0$. Khi đó với điểm khởi đầu đủ gần, lặp Newton thoả
$$\|x_{k+1} - x^*\| \le C \|x_k - x^*\|^2.$$

*Dẫn giải.* Khai triển Taylor của $\nabla f$ tại $x_k$: $\nabla f(x^*) = \nabla f(x_k) + \nabla^2 f(x_k)(x^* - x_k) + R_k$, với $\|R_k\| \le \tfrac{M}{2}\|x_k - x^*\|^2$. Trừ đi phương trình định nghĩa $x_{k+1}$: $0 = \nabla f(x_k) + \nabla^2 f(x_k)(x_{k+1} - x_k)$, được $\nabla^2 f(x_k)(x_{k+1} - x^*) = R_k$. Nhân trái với $\nabla^2 f(x_k)^{-1}$ và chặn chuẩn: $\|x_{k+1} - x^*\| \le \frac{M}{2m}\|x_k - x^*\|^2$. $\blacksquare$
```

```example[Số chữ số đúng nhân đôi: Newton cho √2]
Tìm $\sqrt{2}$ bằng cách giải $g(x) = x^2 - 2 = 0$; lặp Newton $x_{k+1} = x_k - g(x_k)/g'(x_k) = \tfrac12(x_k + 2/x_k)$, khởi đầu $x_0 = 1$:
$$1{,}5 \quad \to \quad 1{,}4167 \quad \to \quad 1{,}414216 \quad \to \quad 1{,}41421356237$$
Sai số: $8{,}6 \times 10^{-2}$, $2{,}4 \times 10^{-3}$, $2{,}1 \times 10^{-6}$, $1{,}6 \times 10^{-12}$. Mỗi bước số chữ số đúng gần như nhân đôi — đặc trưng của hội tụ bậc hai, khác hẳn tuyến tính của giảm gradient.
```

```remark[SGD cho bài toán tổng dữ liệu]
Khi mục tiêu là tổng trên dữ liệu, $f(x) = \frac{1}{n}\sum_{i=1}^n f_i(x)$, mỗi bước giảm gradient tốn $O(n)$ phép tính gradient. **Giảm gradient ngẫu nhiên (SGD)** lấy $g_k = \nabla f_{i_k}(x_k)$ với chỉ số ngẫu nhiên: $\mathbb{E}[g_k] = \nabla f(x_k)$ (ước lượng không chệch) và chi phí mỗi bước $O(1)$. Lịch bước thoả $\sum \eta_k = \infty$, $\sum \eta_k^2 < \infty$ đảm bảo hội tụ; chi phí mỗi bước $O(1)$ là lý do SGD được dùng trong huấn luyện mô hình quy mô lớn.
```

Điều kiện hội tụ của lịch bước có từ Robbins và Monro [^6]; phân tích hiện đại cho hàm mục tiêu machine learning ở Bottou, Curtis và Nocedal [^7].

```remark[Hình học của hướng giảm: chọn metric]
"Hướng giảm dốc nhất" phụ thuộc cách đo góc. Với chuẩn Euclid, hướng đó là $-\nabla f$; với metric Hessian $\langle d, \nabla^2 f(x) d \rangle$, hướng đó là $-\nabla^2 f(x)^{-1} \nabla f(x)$ — đó là Newton, bất biến với phép đổi biến afin. Thay Hessian bằng ma trận thông tin Fisher (Phần K) cho **gradient tự nhiên**. Một nguyên lý (steepest descent), một họ thuật toán — khác nhau ở metric; metric nên phản ánh hình học của bài toán, không phải tiện lợi của toạ độ.
```

## Phần G — Tối ưu rời rạc

```definition[Tối ưu nguyên]
Bài toán tối ưu **nguyên (integer programming)** là bài toán tối ưu với ràng buộc $x \in \mathbb{Z}^n$ (hoặc một phần biến nguyên — mixed-integer). Ví dụ: số máy chạy, số lô sản xuất, quyết định chọn/không chọn một dự án ($x_i \in \{0, 1\}$).
```

```remark[Tính khó]
Tối ưu nguyên nói chung là NP-khó: không có thuật toán đa thức được biết. Kỹ thuật chuẩn là **LP lỏng (LP relaxation)** — bỏ điều kiện nguyên — cho một cận: với bài toán $\max$, cận LP là cận trên của mọi nghiệm nguyên. Khoảng cách giữa cận LP và nghiệm nguyên tốt nhất là thước đo độ khó của thể hiện.
```

Trình bày hệ thống của tối ưu nguyên ở Wolsey [^20] và Conforti, Cornuéjols, Zambelli [^21].

```example[LP lỏng của bài toán cái túi]
Bài toán cái túi: chọn các món hàng $A, B, C, D$ với giá trị và khối lượng $(10; 4)$, $(9; 4)$, $(5; 3)$, $(3; 2)$, túi chứa tối đa 10. LP lỏng sắp theo tỉ lệ giá trị/khối lượng ($2{,}5$, $2{,}25$, $1{,}67$, $1{,}5$) và lấy phần nhỏ của $C$: giá trị $22{,}33$ với $C = 2/3$. Nghiệm nguyên tối ưu là $A + B + D = 22$ (khối lượng $4 + 4 + 2 = 10$). Khoảng cách $0{,}33$ phản ánh việc không thể cắt $C$ ra phần nhỏ.
```

```definition[Branch and bound]
**Branch and bound (nhánh và cận)** giải bài toán nguyên bằng cách duyệt có kiểm soát:

1. **Cận (bound).** Giải LP lỏng tại nút; giá trị của nó là cận trên (với bài toán $\max$).
2. **Chia (branch).** Nếu nghiệm LP lỏng có biến $x_j$ không nguyên, tạo hai nút con: $x_j \le \lfloor x_j \rfloor$ và $x_j \ge \lceil x_j \rceil$.
3. **Cắt tỉa (prune).** Một nút bị cắt khi: nghiệm nguyên (cập nhật incumbent), cận LP không vượt incumbent, hoặc không khả thi.

Mỗi nút bị cắt loại toàn bộ nhánh con của nó; hiệu quả của thuật toán nằm ở chỗ cắt được nhiều.
```

```example[Branch and bound cho bài toán cái túi]
Áp dụng vào bài toán cái túi ở trên (Hình 5). Nút gốc: LP lỏng $22{,}33$ với $C = 2/3$ — không nguyên, chia theo $C$.

- **Nhánh $C = 0$:** LP lỏng trên $\{A, B, D\}$ cho $22$, nghiệm nguyên $A + B + D$. Cập nhật incumbent $= 22$.
- **Nhánh $C \ge 1$:** lấy $C$ (khối lượng 3, giá trị 5); LP lỏng trên 7 đơn vị còn lại cho $21{,}75 < 22$. Cận dưới incumbent → cắt tỉa toàn nhánh.

Cây có ba nút; nghiệm tối ưu $A + B + D = 22$ được chứng nhận không cần duyệt thêm. Với bài toán lớn hơn, số nút có thể bùng nổ, và đây là lý do các bộ giải công nghiệp bổ sung **cắt phẳng (cutting planes)** — branch and cut — để siết chặt LP lỏng ngay từ gốc.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/bb-tree.svg" alt="Cây branch and bound của bài toán cái túi" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 5 — Cây branch and bound: nút gốc LP = 22,33 (C = ⅔); nhánh C = 0 cho nghiệm nguyên 22 (incumbent); nhánh C ≥ 1 bị cắt vì 21,75 < 22. Mỗi nút bị cắt loại cả nhánh con.</figcaption></figure>

## Phần H — Quyết định dưới bất định và đa mục tiêu

```definition[Tối ưu bền vững]
Khi tham số của bài toán không biết chính xác mà nằm trong tập bất định $U$, **tối ưu bền vững** yêu cầu nghiệm tốt nhất theo nghĩa xấu nhất:
$$\min_x \ \max_{u \in U} f(x, u) \quad \text{s.t.} \quad g_i(x, u) \le 0 \ \forall u \in U.$$
Với $U$ là tập lồi compact và $f$, $g$ lồi theo $(x, u)$, bài toán min–max có thể viết lại thành bài toán lồi tương đương (lấy cực đại của họ hàm lồi là hàm lồi).
```

Lý thuyết đầy đủ của tối ưu bền vững ở Ben-Tal, El Ghaoui và Nemirovski [^8].

Tối ưu bền vững trả lời câu hỏi "phương án nào tốt nhất trong tình huống xấu nhất chấp nhận được", khác với tối ưu ngẫu nhiên trả lời "tốt nhất theo kỳ vọng". Hai câu hỏi khác nhau và cho nghiệm khác nhau; chọn cái nào tuỳ bản chất bất định — đối thủ thực sự (thị trường, thiên nhiên) hay nhiễu ngẫu nhiên có phân phối biết trước.

```remark[Đa mục tiêu và nghiệm Pareto]
Nhiều quyết định có nhiều tiêu chí không so sánh được: $\min (f_1(x), f_2(x))$. Khái niệm nghiệm thay bằng **nghiệm Pareto**: $x$ là Pareto nếu không tồn tại $y$ khả thi với $f_i(y) \le f_i(x)$ mọi $i$ và bất đẳng thức chặt tại ít nhất một chỉ số. Hai kỹ thuật chuẩn: tổng trọng số $\min \sum_i w_i f_i(x)$ với $w > 0$ (cho nghiệm Pareto khi bài toán lồi) và ràng buộc $\epsilon$: $\min f_1(x)$ sao cho $f_2(x) \le \epsilon$. Tổng trọng số không vén được phần lõm của biên Pareto; ràng buộc $\epsilon$ thì có.
```

Tài liệu chuẩn về đa mục tiêu là Miettinen [^9].

```remark[Tóm tắt: chọn công cụ]
Bảng sau tóm tắt toàn bộ bản đồ lựa chọn.
```

| Cấu trúc bài toán | Công cụ | Cơ sở |
|---|---|---|
| Liên tục, lồi, không ràng buộc | Giảm gradient, Newton, L-BFGS | Phần F |
| Liên tục, lồi, có ràng buộc | KKT + điểm trong, phương pháp phạt | Phần E |
| Tuyến tính (LP) | Đơn hình, điểm trong primal–dual | Phần C, D |
| Nguyên (ILP/MILP) | Branch and bound, branch and cut | Phần G |
| Tham số bất định | Tối ưu bền vững (min–max), ngẫu nhiên (kỳ vọng) | Phần H |
| Nhiều tiêu chí | Trọng số, ràng buộc ε, biên Pareto | Phần H |
| Dữ liệu lớn, tổng hàm | SGD, phương pháp bậc nhất ngẫu nhiên | Phần F |
| Ngẫu nhiên (kỳ vọng) | SAA, hai giai đoạn, CVaR | Phần I |
| Bất định (xấu nhất) | Robust: hộp, ellipsoid, budgeted | Phần J |
| Phân phối (thông tin) | Cực đại entropy, KL/MLE, MAP, gradient tự nhiên | Phần K |
| Trực tuyến (đối thủ) | Trọng số nhân, regret, minimax | Phần L |
| Ứng dụng: chiết xuất dược liệu | RSM + KKT + giá bóng, xác nhận hai giai đoạn | Phần M |
| Suy luận không có likelihood | ABC, VI/ELBO, HMC–NUTS, neural SBI | Phần N |

Hai nguyên tắc xuyên suốt. Thứ nhất, mô hình hoá quyết định hầu hết công việc: sai mục tiêu hoặc thiếu ràng buộc làm mọi thuật toán trở nên vô nghĩa. Thứ hai, kiểm tra tính lồi trước khi chọn thuật toán — nó quyết định lời hứa "toàn cục" có đứng vững hay không.

## Phần I — Tối ưu ngẫu nhiên

Khi tham số của bài toán là biến ngẫu nhiên $\xi$ với phân phối biết trước (hoặc ước lượng được), quyết định tự nhiên là cực tiểu hoá chi phí **kỳ vọng**. Khác với tối ưu bền vững (xấu nhất), tối ưu ngẫu nhiên trả lời câu hỏi "tốt nhất theo trung bình". Hai câu hỏi cho hai nghiệm khác nhau; cái nào đúng tuỳ bản chất của tình huống.

```definition[Tối ưu theo kỳ vọng và SAA]
Bài toán tối ưu ngẫu nhiên hai giai đoạn có dạng
$$\min_x \; \mathbb{E}_\xi\bigl[f(x, \xi)\bigr] \quad \text{s.t.} \quad x \in X,$$
trong đó kỳ vọng lấy theo phân phối của $\xi$. Khi phân phối chỉ biết qua mẫu $\xi_1, \ldots, \xi_N$, **xấp xỉ mẫu (sample average approximation, SAA)** thay kỳ vọng bằng trung bình mẫu $\frac{1}{N}\sum_{i=1}^N f(x, \xi_i)$, và bài toán trở thành một bài toán tất định thường.
```

```remark[Góc nhìn thống kê: luật số lớn và CLT]
SAA là quyết định dựa trên ước lượng. Theo luật số lớn, trung bình mẫu hội tụ về kỳ vọng; theo định lý giới hạn trung tâm (Phần 3 của loạt bài thống kê), sai số của trung bình mẫu có độ lớn $\sigma/\sqrt{N}$. Giá trị tối ưu của SAA hội tụ về giá trị tối ưu đúng khi $N \to \infty$, và khoảng tin cậy của nó xây được từ CLT. Trong tối ưu ngẫu nhiên, chất lượng quyết định phụ thuộc chất lượng ước lượng: cùng một luật số lớn đứng sau cả hai.
```

```example[Newsvendor: đặt bao nhiêu tờ báo]
Một đại lý mua $q$ tờ báo giá 3 (đơn vị) và bán giá 6; tờ thừa cuối ngày thu hồi được 1. Chi phí tồn dư $c_o = 3 - 1 = 2$, chi phí thiếu hụt $c_u = 6 - 3 = 3$. Nhu cầu $D$ phân bố đều trên $[0, 100]$. Chi phí kỳ vọng:
$$C(q) = c_o\, \mathbb{E}[(q-D)_+] + c_u\, \mathbb{E}[(D-q)_+] = \frac{c_o q^2}{200} + \frac{c_u (100-q)^2}{200}.$$
Đạo hàm $C'(q) = c_o q/100 - c_u(100-q)/100 = 0$ cho $q^* = 100 \cdot \frac{c_u}{c_u + c_o} = 60$; $C'' = (c_o+c_u)/100 > 0$ nên đây là cực tiểu. Bảng kiểm tra: $C(40) = 70$, $C(50) = 62{,}5$, $C(60) = 60$, $C(70) = 62{,}5$, $C(80) = 70$ — đối xứng quanh 60. Quy tắc chung: đặt hàng sao cho $F(q^*) = c_u/(c_u + c_o)$, tức xác suất hết hàng đúng bằng tỉ số chi phí thiếu hụt trên tổng hai chi phí.
```

Bài toán newsvendor là chuẩn cho quyết định dưới rủi ro; xử lý tổng quát ở Shapiro, Dentcheva và Ruszczyński [^26].

```definition[VaR và CVaR]
Khi tổn thất $L(x, \xi)$ ngẫu nhiên, quyết định theo kỳ vọng bỏ qua đuôi phân phối, nơi các tổn thất lớn nhất nằm. Với mức $\alpha \in (0, 1)$: **VaR** là định lượng $\mathrm{VaR}_\alpha(L) = \min\{t : P(L \le t) \ge \alpha\}$; **CVaR** là trung bình tổn thất vượt VaR. CVaR là hàm lồi theo $x$ (khi $L$ lồi theo $x$) và có công thức biến phân đưa rủi ro về tối ưu lồi chuẩn:
$$\mathrm{CVaR}_\alpha(L) = \min_t \; t + \frac{1}{1-\alpha}\, \mathbb{E}[(L - t)_+].$$
```

Công thức trên do Rockafellar và Uryasev [^27] đưa ra: thêm một biến vô hướng $t$ và một số hạng kỳ vọng lồi, bài toán quản trị rủi ro trở thành tối ưu lồi giải được bằng mọi công cụ của Phần F. Lựa chọn giữa kỳ vọng và CVaR là lựa chọn giữa hai câu hỏi: "tổng chi phí trung bình sau nhiều lần lặp" (luật số lớn) hay "trung bình của những tình huống tồi tệ nhất" (quyết định một lần, hậu quả đuôi lớn).

## Phần J — Tối ưu bền vững dưới kính hiển vi

Phần H đã cho định nghĩa tổng quát. Phần này định lượng: giá phải trả để loại bỏ rủi ro, hình học của các dạng tập bất định, và mối liên hệ với ràng buộc xác suất.

```example[Giá của tính bền vững: bài toán khẩu phần bất định]
Giả sử hàm lượng protein của thức ăn A không biết chính xác, nằm trong $[2{,}7; 3{,}3]$ (danh nghĩa 3,0). Với ràng buộc $\ge$, tình huống xấu nhất là hệ số nhỏ nhất 2,7.

- **Nghiệm danh nghĩa** (dùng 3,0): $(1{,}6; 1{,}2)$, chi phí 10,0. Nếu hàm lượng thật là 2,7, protein thực tế $2{,}7 \cdot 1{,}6 + 1{,}2 = 5{,}52 < 6$ — vi phạm 0,48.
- **Nghiệm bền vững** (dùng 2,7 cho mọi $a \in [2{,}7; 3{,}3]$): $(1{,}818; 1{,}091)$, chi phí 10,545. Kiểm tra toàn miền: protein từ 6,0 (tại $a = 2{,}7$) đến 7,09 (tại $a = 3{,}3$), năng lượng 8,0, xơ 7,27 — khả thi với mọi giá trị của $a$.

**Giá của tính bền vững** (price of robustness): $10{,}545 - 10{,}0 = 0{,}545$, tức 5,5% chi phí danh nghĩa — số tiền trả để loại bỏ rủi ro vi phạm dinh dưỡng. Đây là thước đo định lượng chính của tối ưu bền vững.
```

Khái niệm giá của tính bền vững và cách đo nó do Bertsimas và Sim [^33] hệ thống hoá.

```remark[Hình học của tập bất định]
Dạng của tập bất định $U$ quyết định độ phức tạp của bài toán bền vững và mức "bi quan" của nghiệm:

- **Hộp (box)**: $U = \{u : |u_i - \bar u_i| \le \rho_i\}$ — mọi tham số đồng thời ở mức xấu nhất; bài toán bền vững giữ cấu trúc LP nhưng thường quá bi quan (ví dụ trên giả định mọi hệ số cùng lệch).
- **Ellipsoid**: $U = \{u : (u-\bar u)^\top \Sigma^{-1}(u-\bar u) \le 1\}$ — ràng buộc bền vững trở thành bất đẳng thức bậc hai (SOCP), vẫn giải được hiệu quả bằng điểm trong.
- **Budgeted (ngân sách)**: $U_\Gamma = \{u : \sum_i |u_i - \bar u_i|/\rho_i \le \Gamma\}$ — tối đa $\Gamma$ hệ số lệch khỏi danh nghĩa; $\Gamma = 0$ là bài toán danh nghĩa, $\Gamma$ lớn dần tiến về hộp đầy đủ, và LP được bảo toàn.

Góc nhìn hình học: hộp là bóng $L_\infty$, ellipsoid là bóng $L_2$, budgeted là giao của hộp với bóng $L_1$ — các chuẩn khác nhau định nghĩa "mức độ bất định" khác nhau, và chuẩn càng lớn thì nghiệm càng bi quan.
```

```remark[Góc nhìn xác suất: ràng buộc cơ hội]
Thay vì đòi $g(x, \xi) \le 0$ với mọi $\xi \in U$, có thể đòi với xác suất cao: $P\bigl(g(x, \xi) \le 0\bigr) \ge 1 - \alpha$ — **ràng buộc cơ hội (chance constraint)**. Với $\xi$ chuẩn và $g$ tuyến tính, ràng buộc này tương đương một bất đẳng thức tuyến tính dùng định lượng chuẩn tắc — cùng bộ công cụ khoảng tin cậy của thống kê. Với phân phối tổng quát, bất đẳng thức Chebyshev hoặc Bernstein chuyển ràng buộc cơ hội thành tập bất định bảo toàn cấu trúc. Hai góc nhìn gặp nhau: robust với tập $U$ tương đương ràng buộc cơ hội đồng thời trên một họ phân phối — chọn $U$ cũng là chọn giả định xác suất.
```

Lý thuyết đầy đủ của tối ưu ngẫu nhiên và bền vững, cùng quan hệ với ràng buộc cơ hội, ở Shapiro, Dentcheva và Ruszczyński [^26] và Ben-Tal, El Ghaoui và Nemirovski [^8].

## Phần K — Tối ưu và lý thuyết thông tin

Một lớp bài toán quyết định có mục tiêu là lượng thông tin: entropy, phân kỳ Kullback–Leibler, hợp lý. Góc nhìn này nối tối ưu hoá với thống kê và machine learning.

```definition[Cực đại entropy]
Entropy của phân phối rời rạc $p$: $H(p) = -\sum_i p_i \ln p_i$ (đơn vị nats); mật độ liên tục dùng tích phân. **Nguyên lý cực đại entropy**: trong các phân phối thoả các ràng buộc đã biết (kỳ vọng, phương sai), chọn phân phối có entropy lớn nhất — phân phối ít giả định nhất phù hợp với thông tin sẵn có. Bài toán cực đại một hàm lõm dưới ràng buộc tuyến tính, giải bằng KKT (Phần E).
```

Nguyên lý này do Jaynes [^28] đặt nền năm 1957, xuất phát từ chính câu hỏi của vật lý thống kê: phân phối vi mô nào tương thích với các đại lượng vĩ mô đo được.

```example[Cực đại entropy với ràng buộc kỳ vọng]
Tìm mật độ $p$ trên $[0, \infty)$ cực đại $H(p) = -\int p \ln p$ với $\int x p(x)\,dx = 2$ và $\int p = 1$. Lagrangian với nhân tử $\lambda, \mu$: biến phân theo $p$ cho $\ln p + 1 = \lambda x + \mu$, suy ra $p(x) \propto e^{\lambda x}$ — phân phối **mũ** với kỳ vọng 2, tức tham số $\lambda = -1/2$. Entropy: $H = 1 - \ln|\lambda| = 1 + \ln 2 \approx 1{,}69$ nats. Tương tự, với phương sai $\sigma^2$ cố định trên $\mathbb{R}$, phân phối cực đại entropy là chuẩn với $H = \tfrac12 \ln(2\pi e \sigma^2) \approx 1{,}42$ nats khi $\sigma = 1$. Hai kết quả này giải thích vì sao mũ và chuẩn phổ biến: chúng là các phân phối cực đại entropy dưới các ràng buộc tương ứng.
```

```remark[MLE là cực tiểu hoá phân kỳ KL]
Với dữ liệu $x_1, \ldots, x_n$ từ phân phối thực nghiệm $p_{\rm emp}$ và họ mô hình $p_\theta$, ước lượng hợp lý tối đa cực tiểu hoá phân kỳ Kullback–Leibler:
$$\hat\theta = \arg\max_\theta \sum_i \ln p_\theta(x_i) = \arg\min_\theta \; \mathrm{KL}(p_{\rm emp} \| p_\theta),$$
vì log-likelihood chuẩn hoá hội tụ về $\mathbb{E}[\ln p_\theta]$, và cực đại hoá nó tương đương cực tiểu hoá $\mathrm{KL}(p \| p_\theta)$ trừ một hằng số entropy. Ví dụ: dữ liệu 1, 2, 3 với họ chuẩn cho $\hat\mu = 2$, $\hat\sigma^2 = 2/3$ — đúng moment của phân phối thực nghiệm; bài toán lồi với lời giải đóng.
```

Khung phân kỳ và entropy, cùng các bất đẳng thức thông tin, trình bày hệ thống ở Cover và Thomas [^29].

```definition[MAP và điều chuẩn: góc nhìn Bayes]
Với tiên nghiệm $p(\theta)$, hậu nghiệm $p(\theta|D) \propto p(D|\theta)\, p(\theta)$; ước lượng MAP cực tiểu hoá $-\ln p(\theta|D) = -\ln p(D|\theta) - \ln p(\theta)$. Số hạng đầu là mất mát dữ liệu, số hạng thứ hai là **điều chuẩn (regularization)**:

- Tiên nghiệm chuẩn $\theta \sim \mathcal{N}(0, \sigma^2 I)$ → điều chuẩn $L_2$ (ridge): $\min \sum_i (y_i - x_i^\top \theta)^2 + \lambda\|\theta\|_2^2$.
- Tiên nghiệm Laplace → điều chuẩn $L_1$ (LASSO): $\min \sum_i (y_i - x_i^\top \theta)^2 + \lambda\|\theta\|_1$.

Hình học: quả cầu $L_1$ có góc nhọn nên nghiệm bị kéo về 0 (chọn biến); quả cầu $L_2$ trơn nên nghiệm co nhưng không triệt tiêu. Xác suất: hai hình học tương ứng hai giả định tiên nghiệm khác nhau.
```

```remark[Hình học thông tin: gradient tự nhiên]
Trên không gian tham số của một họ phân phối, "khoảng cách" tự nhiên không phải Euclid mà là thông tin Fisher $I(\theta) = \mathbb{E}\bigl[(\partial_\theta \ln p_\theta)^2\bigr]$ — metric của hình học thông tin. **Gradient tự nhiên** $\tilde\nabla f = I(\theta)^{-1} \nabla f$ là hướng giảm dốc nhất theo metric này. Với họ mũ (chuẩn, Poisson, logistic), $I(\theta)$ trùng Hessian của log-likelihood, nên gradient tự nhiên trùng Newton (Phần F): Newton của bài toán hợp lý là gradient tự nhiên, và metric Fisher là Hessian nhìn từ góc thống kê.
```

Tài liệu chuẩn của hình học thông tin: Amari [^30].

## Phần L — Tối ưu như trò chơi

```definition[Trò chơi tổng không và định lý minimax]
Trò chơi tổng không: người I chọn $x \in X$, người II chọn $y \in Y$; người I trả người II $f(x, y)$. Định lý minimax của von Neumann: với $X$, $Y$ compact lồi và $f$ liên tục, lồi theo $x$, lõm theo $y$,
$$\min_x \max_y f(x, y) = \max_y \min_x f(x, y) = f(x^*, y^*),$$
tồn tại điểm yên ngựa $(x^*, y^*)$. Đây là đối ngẫu mạnh (Phần D) dưới hình thức trò chơi: bài toán gốc là $\min_x \max_{y \ge 0} L(x, y)$ với $L$ là Lagrangian; biến đối ngẫu là chiến lược của đối thủ.
```

```remark[Học trực tuyến và regret]
Trong **tối ưu trực tuyến**, tại mỗi bước $t$ người chơi chọn $x_t$ rồi mới thấy hàm mất mát $f_t$ (thị trường, thời tiết, đối thủ). Mục tiêu là cực tiểu **regret** — tổng mất mát so với phương án tốt nhất cố định $x^*$:
$$\mathrm{Regret}_T = \sum_{t=1}^T f_t(x_t) - \min_x \sum_{t=1}^T f_t(x).$$
Thuật toán **trọng số nhân (multiplicative weights)** trên đơn hình đạt regret $O(\sqrt{T \ln n})$: mất mát trung bình hội tụ về mất mát tối ưu cố định. Hệ quả: nếu cả hai người chơi của một trò chơi đều dùng thuật toán no-regret, kết quả trung bình hội tụ về giá trị minimax — đối ngẫu mạnh nhìn từ góc học máy.
```

Tài liệu của học trực tuyến: Shalev-Shwartz [^31] và Cesa-Bianchi, Lugosi [^32].

```remark[Hình học của mirror descent]
Gradient descent là trường hợp riêng của **mirror descent**:
$$x_{t+1} = \arg\min_x \Bigl\{\langle \nabla f(x_t), x \rangle + \tfrac{1}{\eta} D_\phi(x, x_t)\Bigr\},$$
với $D_\phi$ là phân kỳ Bregman. Chọn $\phi(x) = \tfrac12\|x\|_2^2$ được gradient descent; chọn $\phi$ là entropy âm được **exponentiated gradient** trên đơn hình, với $D_\phi = \mathrm{KL}$ — cùng tư tưởng "bước theo metric của không gian" như gradient tự nhiên (Phần K). Một công thức, ba hình học: Euclid, thông tin, và đơn hình.
```

## Phần M — Bài toán: chọn điều kiện chiết xuất dược liệu

Phần này áp dụng các công cụ của bài vào một bài toán quyết định thực tế: chọn điều kiện chiết xuất một hợp chất hoạt tính từ dược liệu. Quy trình gồm ba bước — mô hình hoá (RSM), giải bằng KKT, đọc kết quả bằng giá bóng — và mọi con số dưới đây là nghiệm của chính bài toán được phát biểu.

```example[Phát biểu bài toán]
Một phòng thí nghiệm nghiên cứu chiết xuất flavonoid từ một dược liệu. Ba biến quyết định: nhiệt độ chiết $T$ (°C), nồng độ ethanol $C$ (%), thời gian chiết $t$ (phút). Hiệu suất $Y$ (mg/g) được mô hình hoá bằng đa thức bậc hai — chuẩn của phương pháp bề mặt đáp ứng (response surface methodology):
$$Y = 9{,}2 + 0{,}30u + 0{,}26v + 0{,}10w - 0{,}014u^2 - 0{,}009v^2 - 0{,}002w^2 + 0{,}005uv,$$
với $u = T - 60$, $v = C - 55$, $w = t - 75$ (toạ độ tâm hoá quanh điểm giữa của miền). Ràng buộc: $T \le 75$ (trên mức này flavonoid phân huỷ), $C \le 70$ (giới hạn chi phí dung môi), $t \le 90$ (ngân sách của một ca chiết), cùng biên vật lý $T \in [40, 80]$, $C \in [30, 80]$, $t \in [30, 120]$. Bài toán: chọn $(T, C, t)$ để cực đại $Y$.
```

Mô hình bậc hai trên được ước lượng từ một thiết kế trung tâm tổ hợp (central composite design) — quy trình thực nghiệm do Box và Wilson [^34] đề xuất, trình bày đầy đủ ở Myers, Montgomery và Anderson-Cook [^35].

```example[Giải bằng KKT]
Điều kiện dừng không ràng buộc: $\partial Y/\partial u = 0{,}30 - 0{,}028u + 0{,}005v = 0$; $\partial Y/\partial v = 0{,}26 - 0{,}018v + 0{,}005u = 0$; $\partial Y/\partial w = 0{,}10 - 0{,}004w = 0$. Nghiệm: $u = 13{,}99$ ($T = 74{,}0$), $v = 18{,}33$ ($C = 73{,}3$), $w = 25$ ($t = 100$). Điểm này vi phạm $C \le 70$ và $t \le 90$: cực đại không ràng buộc không khả thi.

Kẹp hai ràng buộc hoạt động: $v = 15$ ($C = 70$) và $w = 15$ ($t = 90$). Phương trình còn lại theo $u$: $0{,}30 - 0{,}028u + 0{,}005 \cdot 15 = 0$, cho $u = 13{,}39$ ($T = 73{,}4$). Kiểm tra: $T = 73{,}4 \le 75$ — thoả. Nghiệm tối ưu: $(73{,}4°C;\ 70\%;\ 90\ \text{phút})$, hiệu suất $Y^* = 14{,}64$ mg/g (Hình 6).

Nhân tử KKT: $\lambda_C = \partial Y/\partial v = 0{,}26 - 0{,}018 \cdot 15 + 0{,}005 \cdot 13{,}39 \approx 0{,}057$; $\lambda_t = \partial Y/\partial w = 0{,}10 - 0{,}004 \cdot 15 = 0{,}040$; $\partial Y/\partial u = 0$ tại nghiệm — nhiệt độ không phải ràng buộc hoạt động. Hessian âm xác định (định thức $4{,}79 \times 10^{-4} > 0$, phần tử chéo âm): bề mặt lõm, điểm dừng là cực đại toàn cục (Phần B).
```

<figure style="margin:1.8em 0;"><img src="/img/opt/extraction.svg" alt="Bề mặt đáp ứng chiết xuất dược liệu" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 6 — Bề mặt đáp ứng Y(T, C) tại t = 90 phút. Miền khả thi (tô xanh) bị chặn bởi C = 70 và T = 75; tối ưu (73,4 ; 70) nằm trên biên C = 70. Cực đại không ràng buộc (74,0 ; 73,3) nằm ngoài miền.</figcaption></figure>

Bảng kiểm chứng các điểm ứng viên quanh nghiệm (t = 90 phút trừ hàng cuối):

| Điều kiện (T; C; t) | Y (mg/g) | Ghi chú |
|---|---|---|
| (60; 55; 90) | 10,25 | điểm trung tâm của thiết kế |
| **(73,4; 70; 90)** | **14,64** | nghiệm tối ưu |
| (75; 70; 90) | 14,60 | chạm biên nhiệt độ — kém hơn |
| (70; 70; 90) | 14,48 | dưới nhiệt độ tối ưu |
| (73,4; 70; 100) | 14,84 | vi phạm ngân sách thời gian |

```remark[Đọc kết quả: quyết định và giới hạn]
Bốn nhận xét. Thứ nhất, **giá bóng của thời gian** $\lambda_t = 0{,}04$ mg/g mỗi phút: kéo dài ca chiết thêm 10 phút tăng hiệu suất $14{,}84 - 14{,}64 = 0{,}20$ mg/g — nhưng độ tăng biên giảm dần vì bề mặt lõm, nên quyết định "mua thêm thời gian" là so sánh chi phí vận hành với lợi ích biên này. Thứ hai, **giá bóng của ethanol** $\lambda_C \approx 0{,}057$ mg/g mỗi điểm phần trăm — cơ sở định lượng để đàm phán chi phí dung môi. Thứ ba, ràng buộc nhiệt độ **không hoạt động**: chạm $T = 75$ không giúp ích gì ($14{,}60 < 14{,}64$), nên giữ 73–74 °C là đủ. Thứ tư, mô hình là ước lượng từ thực nghiệm: quy trình chuẩn là tối ưu trên mô hình rồi chạy thực nghiệm xác nhận tại điểm tối ưu và lân cận — đúng cấu trúc hai giai đoạn của Phần I (tối ưu trên ước lượng SAA) và của thực hành thống kê nói chung.
```

## Phần N — Suy luận dựa trên mô phỏng (simulation-based inference)

Nhiều mô hình quyết định hiện đại có thể **mô phỏng** nhưng không thể **đánh giá likelihood**: động học phản ứng với nhiễu đo phức tạp, mô hình dịch tễ dựa trên tác nhân, dược động học nhiều ngăn, mô phỏng vật lý nặng. Suy luận dựa trên mô phỏng (SBI) — còn gọi là suy luận không likelihood (likelihood-free) — ước lượng hậu nghiệm Bayes chỉ bằng cách chạy mô phỏng. Các khái niệm của bài này — xác suất, KL, tối ưu ngẫu nhiên, gradient — xuất hiện lại ở đây dưới dạng mới.

```definition[Suy luận dựa trên mô phỏng]
Mô hình $y = g(\theta, \xi)$: cho tham số $\theta$ và nhiễu $\xi$, chạy mô phỏng cho ra dữ liệu $y$, nhưng mật độ $p(y|\theta)$ không có dạng đóng và không tính được. **Suy luận dựa trên mô phỏng** ước lượng hậu nghiệm $p(\theta|y) \propto p(y|\theta)\, p(\theta)$ chỉ bằng các lần chạy mô phỏng — không bao giờ đánh giá $p(y|\theta)$ trực tiếp.
```

```example[ABC với ví dụ mũ kiểm chứng được]
Quan sát $y_{\rm obs} = 2$ từ mô hình $y \sim \text{Exp}(\theta)$, tiên nghiệm $\theta \sim U(0{,}1;\, 3)$. Mô hình này có likelihood đóng; ta dùng nó để *kiểm chứng* ABC chứ không phải vì cần.

**ABC theo bác bỏ (rejection ABC)**: (1) mô phỏng $\theta \sim U(0{,}1;\, 3)$; (2) mô phỏng $y \sim \text{Exp}(\theta)$; (3) chấp nhận $\theta$ nếu $|y - y_{\rm obs}| \le \varepsilon$; (4) lặp lại. Với $\varepsilon = 0{,}05$ và 400 000 mô phỏng: **3380** mẫu được chấp nhận, tỉ lệ $0{,}845\%$ — khớp giá trị lý thuyết $0{,}833\%$ tính trực tiếp. Trung bình hậu nghiệm ABC: $0{,}97$; hậu nghiệm chính xác $\propto \theta e^{-2\theta}$ (Gamma(2; 2) trên $[0{,}1;\, 3]$) có trung bình $0{,}971$ và mode $0{,}5$ (Hình 7).

Vì sao đúng: $s(y) = y$ là thống kê đủ cho họ mũ, nên $p\bigl(\theta \;\big|\; |y - y_{\rm obs}| \le \varepsilon\bigr) \to p(\theta|y_{\rm obs})$ khi $\varepsilon \to 0$.
```

ABC trong dạng hiện đại do Beaumont, Zhang và Balding [^39] đưa vào di truyền quần thể; ý tưởng "tần suất tương thích Bayes" có từ Rubin [^42].

<figure style="margin:1.8em 0;"><img src="/img/opt/abc.svg" alt="ABC cho ví dụ mũ" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 7 — (a) Phân phối tiên đoán của y dưới tiên nghiệm; dải |y − 2| ≤ ε (vàng) là vùng chấp nhận. (b) Hậu nghiệm ABC (teal, 3380 mẫu) hầu như trùng hậu nghiệm chính xác Gamma(2; 2) (vàng): trung bình 0,97, mode 0,5.</figcaption></figure>

```remark[ABC như một bài toán tối ưu ngẫu nhiên]
ABC là tối ưu hoá ở dạng thô nhất: tìm $\theta$ sao cho khoảng cách giữa dữ liệu mô phỏng và dữ liệu quan sát đủ nhỏ — tìm kiếm ngẫu nhiên trên không gian tham số, với $\varepsilon$ đóng vai trò ngưỡng dừng. Ba liên hệ với bài này. Thứ nhất, $\varepsilon$ như băng thông: bé thì chính xác nhưng tỉ lệ chấp nhận thấp (chi phí mô phỏng bùng nổ), lớn thì thiên lệch — đánh đổi bias–variance quen thuộc. Thứ hai, chọn thống kê tóm tắt $s(y)$ quyết định chất lượng: thống kê đủ cho hậu nghiệm đúng, thống kê kém cho hậu nghiệm lệch. Thứ ba, các phiên bản hiệu quả dùng chuỗi $\varepsilon$ giảm dần và đề xuất $\theta$ thông minh thay vì ngẫu nhiên — tư tưởng simulated annealing và stochastic search của Phần F.
```

```remark[Hậu nghiệm là nghiệm của một bài toán tối ưu]
Suy luận Bayes có thể quy về tối ưu hoá. **Suy biến biến phân (variational inference, VI)**: tìm $q$ trong một họ phân phối cực tiểu hoá $\mathrm{KL}(q(\theta) \| p(\theta|y))$ — tương đương cực đại hoá ELBO, giải bằng gradient ngẫu nhiên (Phần F). **MCMC** — Metropolis, Hamiltonian Monte Carlo — lấy mẫu bằng cách đi trên "cảnh quan năng lượng" $-\ln p(\theta|y)$: HMC dùng động lực học Hamilton, mỗi bước Leapfrog tích phân một quỹ đạo, và thuật toán NUTS tự chọn độ dài đường đi. **Neural SBI** (NPE, NRE) huấn luyện một mạng sinh (normalizing flow) $q_\phi(\theta|y)$ bằng cách cực tiểu hoá kỳ vọng của $\mathrm{KL}$ trên dữ liệu mô phỏng: hậu nghiệm *amortised* — huấn luyện một lần, suy luận cho mọi $y$ mới tức thì.
```

Tài liệu chuẩn: Cranmer, Brehmer và Louppe [^36] cho bức tranh tổng thể của SBI; Papamakarios và Murray [^37] cho neural posterior estimation; Lueckmann et al. [^38] cho điểm chuẩn so sánh các phương pháp; Blei, Kucukelbir và McAuliffe [^40] cho VI từ góc nhìn thống kê; Hoffman và Gelman [^41] cho NUTS.

```remark[Khi nào dùng SBI — và các cạm bẫy]
SBI dùng khi likelihood không tính được: động học phản ứng với nhiễu đo phức tạp, mô hình dịch tễ theo tác nhân, dược động học nhiều ngăn, mô phỏng vật lý. Bốn cạm bẫy. Thứ nhất, thống kê tóm tắt phải đủ — thiếu nó, hậu nghiệm lệch ngay cả khi $\varepsilon \to 0$. Thứ hai, chi phí: tỉ lệ chấp nhận ~ 1% nghĩa là 99% mô phỏng bị loại (ví dụ trên: 400 000 mô phỏng cho 3 380 mẫu). Thứ ba, hiệu chuẩn: kiểm tra hậu nghiệm trên dữ liệu mô phỏng có tham số đã biết trước khi tin vào dữ liệu thật. Thứ tư, tiên nghiệm ảnh hưởng mạnh khi thông tin từ dữ liệu yếu — báo cáo cả hai.
```

## Lộ trình tiếp theo

Bài viết này là bản đồ. Để đi sâu theo từng hướng: Boyd và Vandenberghe [^14] cho tối ưu lồi từ cơ bản tới điểm trong; Nocedal và Wright [^16] cho phương pháp số không ràng buộc và có ràng buộc; Bertsimas và Tsitsiklis [^12] và Vanderbei [^13] cho quy hoạch tuyến tính; Wolsey [^20] cho tối ưu nguyên; Ben-Tal, El Ghaoui và Nemirovski [^8] cho tối ưu bền vững. Cho các hướng mới: Shapiro, Dentcheva và Ruszczyński [^26] cho tối ưu ngẫu nhiên; Bertsimas và Sim [^33] cho giá của tính bền vững; Jaynes [^28] và Cover–Thomas [^29] cho góc nhìn thông tin; Amari [^30] cho hình học thông tin; Shalev-Shwartz [^31] và Cesa-Bianchi–Lugosi [^32] cho học trực tuyến. Hai cột mốc lịch sử đáng đọc nguyên bản: Dantzig [^10] về đơn hình và von Neumann [^5] về đối ngẫu — cả hai đều sinh ra từ bài toán quyết định thực tế (quy hoạch sản xuất thời chiến và lý thuyết trò chơi). Với người đọc muốn nối tối ưu hoá với thống kê: bài toán khẩu phần ở đây là họ hàng của hồi quy bình phương tối thiểu ở loạt bài *Thống kê cơ bản cho khoa học sự sống* — cùng một cấu trúc "cực tiểu hoá một hàm trên một tập", chỉ khác công cụ phân tích.

[^1]: L. V. Kantorovich, "Mathematical methods of organizing and planning production," 1939; bản tiếng Anh trong *Management Science* 6(4): 366–422, 1960.
[^2]: G. J. Stigler, "The cost of subsistence," *Journal of Farm Economics* 27(2): 303–314, 1945.
[^3]: V. Klee and G. J. Minty, "How good is the simplex algorithm?" trong *Inequalities III*, 159–175, Academic Press, 1972.
[^4]: N. Karmarkar, "A new polynomial-time algorithm for linear programming," *Combinatorica* 4(4): 373–395, 1984.
[^5]: J. von Neumann, "Discussion of a maximum problem," 1947; xem thêm J. von Neumann and O. Morgenstern, *Theory of Games and Economic Behavior*, Princeton University Press, 1944.
[^6]: H. Robbins and S. Monro, "A stochastic approximation method," *Annals of Mathematical Statistics* 22(3): 400–407, 1951.
[^7]: L. Bottou, F. E. Curtis and J. Nocedal, "Optimization methods for large-scale machine learning," *SIAM Review* 60(2): 223–311, 2018.
[^8]: A. Ben-Tal, L. El Ghaoui and A. Nemirovski, *Robust Optimization*, Princeton University Press, 2009.
[^9]: K. Miettinen, *Nonlinear Multiobjective Optimization*, Kluwer Academic Publishers, 1999.
[^10]: G. B. Dantzig, *Linear Programming and Extensions*, Princeton University Press, 1963.
[^11]: V. Chvátal, *Linear Programming*, W. H. Freeman, 1983.
[^12]: D. Bertsimas and J. N. Tsitsiklis, *Introduction to Linear Optimization*, Athena Scientific, 1997.
[^13]: R. J. Vanderbei, *Linear Programming: Foundations and Extensions*, 5th ed., Springer, 2020.
[^14]: S. Boyd and L. Vandenberghe, *Convex Optimization*, Cambridge University Press, 2004.
[^15]: R. T. Rockafellar, *Convex Analysis*, Princeton University Press, 1970.
[^16]: J. Nocedal and S. J. Wright, *Numerical Optimization*, 2nd ed., Springer, 2006.
[^17]: D. G. Luenberger and Y. Ye, *Linear and Nonlinear Programming*, 4th ed., Springer, 2016.
[^18]: D. P. Bertsekas, *Nonlinear Programming*, 3rd ed., Athena Scientific, 2016.
[^19]: S. J. Wright, *Primal-Dual Interior-Point Methods*, SIAM, 1997.
[^20]: L. A. Wolsey, *Integer Programming*, 2nd ed., Wiley, 2020.
[^21]: M. Conforti, G. Cornuéjols and G. Zambelli, *Integer Programming*, Springer, 2014.
[^22]: A.-L. Cauchy, "Méthode générale pour la résolution des systèmes d'équations simultanées," *Comptes Rendus de l'Académie des Sciences* 25: 536–538, 1847.
[^23]: B. T. Polyak, *Introduction to Optimization*, Optimization Software Inc., 1987.
[^24]: W. Karush, "Minima of functions of several variables with inequalities as side conditions," luận án, University of Chicago, 1939; H. W. Kuhn and A. W. Tucker, "Nonlinear programming," *Proceedings of the Second Berkeley Symposium on Mathematical Statistics and Probability*, 481–492, 1951.
[^25]: M. Slater, "Lagrange multipliers revisited," Cowles Commission Discussion Paper, 1950.
[^26]: A. Shapiro, D. Dentcheva and A. Ruszczyński, *Lectures on Stochastic Programming: Modeling and Theory*, 2nd ed., SIAM, 2014.
[^27]: R. T. Rockafellar and S. Uryasev, "Optimization of conditional value-at-risk," *Journal of Risk* 2(3): 21–41, 2000.
[^28]: E. T. Jaynes, "Information theory and statistical mechanics," *Physical Review* 106(4): 620–630, 1957.
[^29]: T. M. Cover and J. A. Thomas, *Elements of Information Theory*, 2nd ed., Wiley, 2006.
[^30]: S. Amari, *Information Geometry and Its Applications*, Springer, 2016.
[^31]: S. Shalev-Shwartz, "Online learning and online convex optimization," *Foundations and Trends in Machine Learning* 4(2): 107–194, 2011.
[^32]: N. Cesa-Bianchi and G. Lugosi, *Prediction, Learning, and Games*, Cambridge University Press, 2006.
[^33]: D. Bertsimas and M. Sim, "The price of robustness," *Operations Research* 52(1): 35–53, 2004.
[^34]: G. E. P. Box and K. B. Wilson, "On the experimental attainment of optimum conditions," *Journal of the Royal Statistical Society B* 13(1): 1–45, 1951.
[^35]: R. H. Myers, D. C. Montgomery and C. M. Anderson-Cook, *Response Surface Methodology: Process and Product Optimization Using Designed Experiments*, 4th ed., Wiley, 2016.
[^36]: K. Cranmer, J. Brehmer and G. Louppe, "The frontier of simulation-based inference," *Proceedings of the National Academy of Sciences* 117(48): 30055–30062, 2020.
[^37]: G. Papamakarios and I. Murray, "Fast ε-free inference of simulation models with Bayesian conditional density estimation," *Advances in Neural Information Processing Systems* 29, 2016.
[^38]: J.-M. Lueckmann, J. Boelts, D. Greenberg, P. Gonçalves and J. Macke, "Benchmarking simulation-based inference," *Proceedings of AISTATS* 130: 343–351, 2021.
[^39]: M. A. Beaumont, W. Zhang and D. J. Balding, "Approximate Bayesian computation in population genetics," *Genetics* 162(4): 2025–2035, 2002.
[^40]: D. M. Blei, A. Kucukelbir and J. D. McAuliffe, "Variational inference: a review for statisticians," *Journal of the American Statistical Association* 112(518): 859–877, 2017.
[^41]: M. D. Hoffman and A. Gelman, "The No-U-Turn Sampler: adaptively setting path lengths in Hamiltonian Monte Carlo," *Journal of Machine Learning Research* 15: 1593–1623, 2014.
[^42]: D. B. Rubin, "Bayesianly justifiable and relevant frequency calculations for the applied statistician," *Annals of Statistics* 12(4): 1151–1172, 1984.
