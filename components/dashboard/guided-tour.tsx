"use client";

import { useEffect, useCallback } from "react";
import "driver.js/dist/driver.css";
import { useTour } from "@/components/providers/tour-provider";

interface GuidedTourProps {
  hasSeenTour: boolean;
}

export const GuidedTour = ({ hasSeenTour }: GuidedTourProps) => {
  const { registerStartTour } = useTour();

  const markAsSeen = useCallback(async () => {
    try {
      await fetch("/api/settings/tour", { method: "PATCH" });
    } catch {
      // silently ignore — worst case the tour re-shows once more on next login
    }
  }, []);

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.5,
      stagePadding: 8,
      stageRadius: 8,
      smoothScroll: true,
      nextBtnText: "Próximo →",
      prevBtnText: "← Anterior",
      doneBtnText: "Concluir ✓",
      progressText: "{{current}} de {{total}}",
      popoverClass: "clearbalance-tour-popover",
      onDestroyed: () => {
        markAsSeen();
      },
      steps: [
        {
          popover: {
            title: "👋 Bem-vindo ao ClearBalance!",
            description:
              "Vamos fazer um <strong>tour guiado</strong> pelo site para você conhecer todas as funcionalidades e começar a organizar suas finanças. Será rápido!",
            align: "center",
          },
        },
        {
          element: "[data-tour='sidebar-nav']",
          popover: {
            title: "🧭 Navegação",
            description:
              "Use o menu lateral para navegar entre <strong>Dashboard</strong>, <strong>Categorias</strong>, <strong>Metas</strong> e <strong>Configurações</strong>.",
            side: "right",
            align: "center",
          },
        },
        {
          element: "[data-tour='new-transaction']",
          popover: {
            title: "➕ Nova Transação",
            description:
              "Clique aqui para registrar uma nova <strong>receita</strong> ou <strong>despesa</strong> rapidamente.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "[data-tour='month-selector']",
          popover: {
            title: "📅 Seletor de Mês",
            description:
              "Navegue entre os meses para visualizar o histórico financeiro de qualquer período.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='summary-cards']",
          popover: {
            title: "💰 Resumo do Mês",
            description:
              "Aqui você vê suas <strong>Entradas</strong>, <strong>Saídas</strong> e o <strong>Saldo</strong> do mês selecionado.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "[data-tour='charts']",
          popover: {
            title: "📊 Distribuição por Categoria",
            description:
              "Visualize como suas receitas e despesas estão distribuídas entre as categorias.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "[data-tour='goals-chart']",
          popover: {
            title: "🎯 Metas",
            description:
              "Acompanhe o progresso das suas <strong>metas financeiras</strong>. Crie metas na página de Metas.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "[data-tour='variation-charts']",
          popover: {
            title: "📈 Variação Mensal",
            description:
              "Acompanhe a evolução das suas <strong>receitas</strong> e <strong>despesas</strong> ao longo dos últimos 6 meses.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "[data-tour='calendar']",
          popover: {
            title: "📆 Calendário",
            description:
              "Visualize suas transações em um <strong>calendário mensal</strong>. Os dias com movimentações aparecem destacados.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "[data-tour='transactions-table']",
          popover: {
            title: "📋 Transações",
            description:
              "Veja, filtre, edite e exclua todas as suas transações. Use os filtros para encontrar lançamentos específicos.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "[data-tour='help-button']",
          popover: {
            title: "❓ Precisa de Ajuda?",
            description:
              "Clique neste ícone sempre que quiser <strong>rever este tour</strong> ou relembrar como o ClearBalance funciona.",
            side: "right",
            align: "center",
          },
        },
      ],
    });

    driverObj.drive();
  }, [markAsSeen]);

  // Register with context so HelpButton can trigger it
  useEffect(() => {
    registerStartTour(startTour);
  }, [registerStartTour, startTour]);

  // Check if tour should start after redirect or for first-time users
  useEffect(() => {
    const shouldStartTour = sessionStorage.getItem("clearbalance-start-tour");
    if (shouldStartTour === "true") {
      sessionStorage.removeItem("clearbalance-start-tour");
      startTour();
    } else if (!hasSeenTour) {
      startTour();
    }
  }, [hasSeenTour, startTour]);

  return null;
};
